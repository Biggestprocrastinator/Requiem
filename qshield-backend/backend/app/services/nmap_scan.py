import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path


def _locate_nmap() -> list[str]:
    project_root = Path(__file__).resolve().parents[3]
    bundled = project_root / "nmap.exe"
    if bundled.exists():
        return [str(bundled)]
    return ["nmap"]


def _parse_ports(output: str) -> dict:
    ports = {"80": False, "443": False, "8080": False, "8443": False}
    for line in output.splitlines():
        if "80/tcp" in line and "open" in line:
            ports["80"] = True
        if "443/tcp" in line and "open" in line:
            ports["443"] = True
        if "8080/tcp" in line and "open" in line:
            ports["8080"] = True
        if "8443/tcp" in line and "open" in line:
            ports["8443"] = True
    return ports


def scan_ports(domain: str):
    command = _locate_nmap() + ["-p", "80,443,8080,8443", "--open", domain]
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )

        if result.returncode != 0:
            return {
                "domain": domain,
                "ports": {"80": False, "443": False, "8080": False, "8443": False},
            }

        ports = _parse_ports(result.stdout + result.stderr)
        return {
            "domain": domain,
            "ports": ports,
        }

    except (subprocess.TimeoutExpired, OSError):
        return {
            "domain": domain,
            "ports": {"80": False, "443": False, "8080": False, "8443": False},
        }


def _is_outdated_service(info: str) -> bool:
    keywords = ("apache", "openssh", "nginx")
    normalized = (info or "").lower()
    return any(keyword in normalized for keyword in keywords)


def _parse_services_from_xml(xml_path: Path) -> tuple[list[dict], str | None]:
    services: list[dict] = []
    extracted_ip = None
    try:
        tree = ET.parse(xml_path)
    except (ET.ParseError, FileNotFoundError):
        return services, None

    root = tree.getroot()
    for host in root.findall("host"):
        if not extracted_ip:
            for addr in host.findall("address"):
                if (addr.get("addrtype") or "").lower() == "ipv4":
                    extracted_ip = addr.get("addr")
                    break
        for port_elem in host.findall(".//port"):
            state = port_elem.find("state")
            if state is None or state.get("state") != "open":
                continue
            service_el = port_elem.find("service")
            port_num = port_elem.get("portid")
            service_name = (service_el.get("name") if service_el is not None else "") or ""
            product = (service_el.get("product") if service_el is not None else "") or ""
            version = (service_el.get("version") if service_el is not None else "") or ""
            info_text = " ".join(filter(None, [product, version, service_name]))
            services.append({
                "port": int(port_num) if port_num and port_num.isdigit() else None,
                "service": service_name or product or "unknown",
                "product": product,
                "version": version,
                "outdated": _is_outdated_service(info_text),
            })
    return services, extracted_ip


def scan_service_versions(target: str) -> dict:
    if not target:
        return []

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".xml")
    temp_file.close()
    xml_path = Path(temp_file.name)
    command = _locate_nmap() + ["-sV", "-T4", "-oX", str(xml_path), target]
    try:
        subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        services, parsed_ip = _parse_services_from_xml(xml_path)
        return {"services": services, "ip": parsed_ip}
    except (subprocess.TimeoutExpired, OSError):
        return {"services": [], "ip": None}
    finally:
        if xml_path.exists():
            xml_path.unlink()
