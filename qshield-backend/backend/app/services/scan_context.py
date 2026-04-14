from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

BASE_DATA_DIR = Path(__file__).resolve().parents[2] / "data"
SCAN_CONTEXT_FILE = BASE_DATA_DIR / "scan_context.json"


def _ensure_file() -> None:
    BASE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not SCAN_CONTEXT_FILE.exists():
        SCAN_CONTEXT_FILE.write_text("{}", encoding="utf-8")


def load_scan_context() -> dict[str, Any]:
    _ensure_file()
    try:
        return json.loads(SCAN_CONTEXT_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, FileNotFoundError):
        return {}


def save_scan_context(payload: dict[str, Any]) -> None:
    _ensure_file()
    SCAN_CONTEXT_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def build_scan_context(
    *,
    assets: list[dict[str, Any]] | None = None,
    threat_surface: list[dict[str, Any]] | None = None,
    vulnerabilities: list[dict[str, Any]] | None = None,
    cbom: list[dict[str, Any]] | None = None,
    summary: dict[str, Any] | None = None,
    domain: str | None = None,
) -> dict[str, Any]:
    context = load_scan_context()
    if domain is not None:
        context["domain"] = domain
    if assets is not None:
        context["assets"] = assets
    if threat_surface is not None:
        context["threat_surface"] = threat_surface
    if vulnerabilities is not None:
        context["vulnerabilities"] = vulnerabilities
    if cbom is not None:
        context["cbom"] = cbom
    if summary is not None:
        context["summary"] = summary
    save_scan_context(context)
    return context


def call_local_gemini(prompt: str) -> str:
    endpoint = "http://localhost:11434/api/generate"
    model = "gemma4:e4b-it-q4_k_m"

    import urllib.error
    import urllib.request

    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
    }).encode("utf-8")

    request = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw or "{}")
            return str(data.get("response") or "")
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"AI service unavailable: {exc}") from exc


def stream_local_gemini(prompt: str):
    endpoint = "http://localhost:11434/api/generate"
    model = "gemma4:e4b-it-q4_k_m"

    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": True,
    }).encode("utf-8")

    request = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=60) as response:
        for raw_line in response:
            line = raw_line.decode("utf-8").strip()
            if not line:
                continue
            chunk = json.loads(line)
            yield str(chunk.get("response") or "")
            if chunk.get("done"):
                break
