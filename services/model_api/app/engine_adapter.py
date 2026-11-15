"""Adapter between the FastAPI service and the validated rule engine (D2 handoff).

Loads the engine package from the repository, verifies artifact hashes from
`artifacts/manifest.json`, and exposes a readiness verdict. No raw NASA data, no
secrets; hashes are computed over committed artifacts only.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(REPO_ROOT / "science") not in sys.path:
    sys.path.insert(0, str(REPO_ROOT / "science"))  # `engine` package lives in science/

from engine.engine import ENGINE_VERSION, recommend, validate  # noqa: E402  (science/engine)

MANIFEST = json.loads(
    (REPO_ROOT / "services/model_api/artifacts/manifest.json").read_text(encoding="utf-8"))


def _sha256(path: Path) -> str:
    """Platform-independent hash: text files are hashed with LF line endings so a
    Windows checkout (CRLF) and a Linux checkout (LF) of the same committed bytes
    verify identically. Binary artifacts (.joblib) are hashed as-is."""
    h = hashlib.sha256()
    data = path.read_bytes()
    if path.suffix.lower() not in {".joblib", ".png", ".jpg", ".pdf", ".zip"}:
        data = data.replace(b"\r\n", b"\n")
    h.update(data)
    return h.hexdigest()


def verify_artifacts() -> dict:
    """Verify every manifest hash. Returns a verdict dict; never raises."""
    problems: list[str] = []
    for entry in MANIFEST["artifacts"]:
        p = REPO_ROOT / entry["path"]
        if not p.exists():
            problems.append(f"missing: {entry['path']}")
        elif _sha256(p) != entry["sha256"]:
            problems.append(f"hash_mismatch: {entry['path']}")
    return {"ok": not problems, "problems": problems,
            "checked": len(MANIFEST["artifacts"])}


def self_test() -> dict:
    """Minimal deterministic engine round-trip proving the engine answers."""
    probe = {
        "parcel": {"zone": "beni_amir", "irrigation": "flood"},
        "history": [{"crop_id": "wheat"}],
    }
    r = recommend(probe)
    ok = (r.get("status") == "results_available"
          and isinstance(r.get("alternatives"), list)
          and len(r["alternatives"]) >= 1)
    return {"ok": bool(ok), "status": r.get("status")}


def readiness() -> dict:
    artifacts = verify_artifacts()
    engine_run = self_test()
    return {
        "ready": artifacts["ok"] and engine_run["ok"],
        "engine_version": ENGINE_VERSION,
        "artifacts": artifacts,
        "self_test": engine_run,
    }
