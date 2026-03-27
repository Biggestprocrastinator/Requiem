import socket
import ssl
import tempfile
from datetime import datetime, timezone

_NOT_AFTER_FORMATS = (
    "%b %d %H:%M:%S %Y %Z",
    "%b %d %H:%M:%S %Y GMT",
    "%Y%m%d%H%M%SZ",
)


def _parse_not_after(not_after: str) -> datetime | None:
    if not not_after:
        return None
    for fmt in _NOT_AFTER_FORMATS:
        try:
            return datetime.strptime(not_after, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def _decode_cert_from_binary(binary_cert: bytes) -> dict:
    if not binary_cert:
        return {}
    try:
        pem = ssl.DER_cert_to_PEM_cert(binary_cert)
    except Exception:
        return {}

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pem") as handle:
            handle.write(pem.encode("ascii"))
            pem_path = handle.name
        return ssl._ssl._test_decode_cert(pem_path)  # type: ignore[attr-defined]
    except Exception:
        return {}


def get_certificate_expiry(domain: str, port_443_open: bool = True) -> dict:
    if not port_443_open:
        return {
            "expiry_days": None,
            "expiry_date": "Unknown",
            "certificate_status": "NO_TLS",
        }

    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                if not cert or not cert.get("notAfter"):
                    binary_cert = ssock.getpeercert(binary_form=True)
                    decoded = _decode_cert_from_binary(binary_cert)
                    if decoded:
                        cert = decoded

        not_after = cert.get("notAfter")
        if not not_after:
            print("Expiry missing for:", domain)
            return {
                "expiry_days": None,
                "expiry_date": "Unknown",
                "certificate_status": "NO_CERT",
            }

        expiry_dt = _parse_not_after(not_after)
        if not expiry_dt:
            print("Expiry parse failed for:", domain, "value:", not_after)
            return {
                "expiry_days": None,
                "expiry_date": "Unknown",
                "certificate_status": "NO_CERT",
            }

        now = datetime.now(timezone.utc)
        days_left = (expiry_dt - now).days
        status = (
            "CRITICAL"
            if days_left < 15
            else "WARNING"
            if days_left < 30
            else "OK"
        )

        return {
            "expiry_days": days_left,
            "expiry_date": expiry_dt.date().isoformat(),
            "certificate_status": status,
        }
    except Exception as exc:
        print("Certificate expiry error for:", domain, "error:", exc)
        return {
            "expiry_days": None,
            "expiry_date": "Unknown",
            "certificate_status": "UNREACHABLE",
        }

