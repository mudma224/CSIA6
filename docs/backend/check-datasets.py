"""Check a scientist-authored dataset manifest without reading raw farm records.
Usage: python scripts/check-datasets.py --manifest data/manifest.json --root .
Pure standard-library audit; does NOT certify dataset quality or agronomic validity.
"""
import argparse
import hashlib
import json
from pathlib import Path

REQUIRED = {
    "id", "path", "source_url", "license", "version", "geography",
    "start_date", "end_date", "variables_units", "resolution",
    "missing_data", "processing", "quality_checks", "limitations", "model_use"
}

def audit(manifest: dict, root: Path) -> list[str]:
    issues: list[str] = []
    datasets = manifest.get("datasets")
    if not isinstance(datasets, list) or not datasets:
        return ["datasets must be a nonempty array"]
    seen: set[str] = set()
    for n, row in enumerate(datasets):
        prefix = f"datasets[{n}]"
        if not isinstance(row, dict):
            issues.append(f"{prefix}: expected object")
            continue
        for field in sorted(REQUIRED):
            if field not in row or row[field] in (None, "", []):
                issues.append(f"{prefix}: missing {field}")
        name = row.get("id", "")
        if name in seen: issues.append(f"{prefix}: duplicate id {name}")
        seen.add(name)
        file_name = row.get("path")
        if not file_name: continue
        p = (root / str(file_name)).resolve()
        try: p.relative_to(root.resolve())
        except ValueError:
            issues.append(f"{prefix}: file escapes root")
            continue
        if not p.is_file():
            issues.append(f"{prefix}: file missing: {file_name}")
            continue
        if row.get("sha256"):
            hasher = hashlib.sha256()
            with p.open("rb") as handle:
                for chunk in iter(lambda: handle.read(1048576), b""):
                    hasher.update(chunk)
            if hasher.hexdigest().lower() != str(row["sha256"]).lower():
                issues.append(f"{prefix}: sha256 does not match")
    return issues

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--root", type=Path, default=Path("."))
    args = parser.parse_args()
    data = json.loads(args.manifest.read_text(encoding="utf-8"))
    problems = audit(data, args.root)
    print(json.dumps({"ok": not problems,"issues": problems,"count": len(data.get("datasets")) if isinstance(data.get("datasets"), list) else 0},indent=2))
    return 1 if problems else 0

if __name__ == "__main__":
    raise SystemExit(main())
