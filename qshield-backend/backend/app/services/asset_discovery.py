import logging
import re
import socket
import subprocess
from pathlib import Path
from typing import Iterable, List, Tuple

try:
    import dns
    import dns.resolver
except ImportError:  # pragma: no cover
    dns = None


logger = logging.getLogger(__name__)


_DOMAIN_ALLOWED_RE = re.compile(r"^[A-Za-z0-9.-]+$")


def _is_valid_domain(domain: str) -> bool:
    if not domain:
        return False

    candidate = domain.strip()
    if not candidate:
        return False

    if candidate.startswith("*."):
        return False

    if "/" in candidate or " " in candidate or "\t" in candidate:
        return False

    if candidate.startswith(".") or candidate.endswith(".") or "." not in candidate:
        return False

    try:
        ascii_domain = candidate.encode("idna").decode("ascii")
    except UnicodeError:
        return False

    if len(ascii_domain) > 253 or not _DOMAIN_ALLOWED_RE.match(ascii_domain):
        return False

    for label in ascii_domain.split("."):
        if not label or len(label) > 63:
            return False
        if label.startswith("-") or label.endswith("-"):
            return False

    return True


def _resolve_ip(domain: str):
    try:
        return socket.gethostbyname(domain)
    except Exception:
        if dns is None:
            return None
        try:
            answers = dns.resolver.resolve(domain, "A")
            for answer in answers:
                ip_value = str(answer)
                if ip_value:
                    return ip_value
        except Exception:
            return None
    return None


def clean_domain(url: str) -> str:
    if not url:
        return ""

    stripped = url.strip()
    if stripped.startswith("http://"):
        stripped = stripped[len("http://") :]
    elif stripped.startswith("https://"):
        stripped = stripped[len("https://") :]

    stripped = stripped.replace("www.", "", 1)
    stripped = stripped.rstrip("/").strip()
    stripped = stripped.split("/")[0]
    return stripped


def _locate_executable(name: str, fallback: str | None = None) -> List[str]:
    command = [name]
    if fallback:
        project_root = Path(__file__).resolve().parents[3]
        candidate = project_root / fallback
        if candidate.exists():
            return [str(candidate)]
        backend_candidate = project_root / "backend" / fallback
        if backend_candidate.exists():
            return [str(backend_candidate)]
    return command


def _run_subfinder(domain: str) -> Iterable[str]:
    commands = [
        ["subfinder", "-d", domain, "-silent"],
        _locate_executable("subfinder", fallback="subfinder.exe") + ["-d", domain, "-silent"],
    ]

    for command in commands:
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=60,
                check=False,
            )

            if result.returncode != 0:
                logger.warning("Subfinder failed: %s", (result.stderr or "").strip())
                continue

            output = [
                clean_domain(line)
                for line in result.stdout.splitlines()
                if clean_domain(line)
            ]
            if output:
                return output

        except (subprocess.TimeoutExpired, OSError) as exc:
            logger.warning("Subfinder error: %s", exc)
            continue

    return []


def _write_lines(path: Path, lines: Iterable[str]) -> None:
    items = list(lines)
    path.write_text("\n".join(items) + ("\n" if items else ""), encoding="utf-8")


def _read_lines(path: Path) -> List[str]:
    if not path.exists():
        return []
    return [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def _run_httpx(domains_path: Path, http_live_path: Path) -> Tuple[set[str], bool]:
    cmd = _locate_executable("httpx", fallback="httpx.exe") + [
        "-l",
        str(domains_path),
        "-silent",
        "-threads",
        "100",
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )

        live: List[str] = []
        for line in result.stdout.splitlines():
            if not line:
                continue
            url = line.split()[0]
            cleaned = clean_domain(url)
            if cleaned and _is_valid_domain(cleaned):
                live.append(cleaned)
        live = list(dict.fromkeys(live))
        _write_lines(http_live_path, live)

        if result.returncode != 0 and not live:
            error_msg = (result.stderr or "").strip()
            if error_msg:
                logger.warning("HTTPX failed: %s", error_msg)
                return set(), False

        return set(live), True

    except (subprocess.TimeoutExpired, OSError):
        print("HTTPX failed")
        _write_lines(http_live_path, [])
        return set(), False


def _run_dns(domains_path: Path, dns_live_path: Path) -> dict[str, str | None]:
    domains = _read_lines(domains_path)
    resolved: dict[str, str | None] = {}
    dns_live: List[str] = []

    for domain in domains:
        ip_address = _resolve_ip(domain)
        resolved[domain] = ip_address
        if ip_address is not None:
            dns_live.append(domain)

    _write_lines(dns_live_path, dns_live)
    return resolved


def discover_assets(domain: str):
    subdomains = _run_subfinder(domain)
    subdomains = [clean_domain(d) for d in subdomains if clean_domain(d)]
    subdomains = list(set(subdomains))

    cleaned = []
    for d in subdomains:
        if d and not d.startswith("*.") and _is_valid_domain(d):
            cleaned.append(d)
    subdomains = cleaned

    domain_clean = clean_domain(domain)
    if domain_clean and _is_valid_domain(domain_clean) and domain_clean not in subdomains:
        subdomains.insert(0, domain_clean)

    if not subdomains:
        logger.info("No valid subdomains found for %s", domain)
        return []

    domains_path = Path("domains.txt")
    http_live_path = Path("http_live.txt")
    dns_live_path = Path("dns_live.txt")
    nmap_targets_path = Path("nmap_targets.txt")
    nuclei_targets_path = Path("nuclei_targets.txt")

    _write_lines(domains_path, subdomains)
    print(f"Total discovered: {len(subdomains)}")

    print("HTTPX input count:", len(_read_lines(domains_path)))
    http_live, httpx_success = _run_httpx(domains_path, http_live_path)
    if not httpx_success:
        print("HTTPX failed \u2014 not using fallback")
    print("HTTPX output count:", len(http_live))

    resolved_map = _run_dns(domains_path, dns_live_path)

    _write_lines(nmap_targets_path, _read_lines(dns_live_path))
    _write_lines(nuclei_targets_path, _read_lines(http_live_path))

    assets = []
    domains = _read_lines(domains_path)
    print(f"Processing domains: {len(domains)}")
    for candidate in domains:
        ip_address = resolved_map.get(candidate)
        print(f"{candidate} -> {ip_address}")
        live_httpx = candidate in http_live
        assets.append(
            {
                "domain": candidate,
                "ip": ip_address,
                "is_live": ip_address is not None,
                "live_httpx": live_httpx,
            }
        )
    if not assets:
        logger.error("Subfinder returned no domains for %s", domain)
    print("Final assets:", len(assets))

    return assets
