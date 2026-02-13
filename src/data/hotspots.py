"""
Hotspot utilities.

This module loads and validates empirically defined RTI hotspots.
Keep this logic here so notebooks stay clean and reusable.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_hotspots(config_path: Path) -> dict[str, Any]:
    """Load hotspot configuration from a JSON file."""
    with open(config_path, encoding="utf-8") as f:
        return json.load(f)


def validate_hotspots(cfg: dict[str, Any]) -> list[str]:
    """
    Validate hotspot config structure.

    Returns a list of human-readable error messages.
    An empty list means the config is valid.
    """
    errors: list[str] = []

    hotspots = cfg.get("hotspots")
    if not isinstance(hotspots, list):
        return ["'hotspots' must be a list"]

    seen_ids: set[str] = set()

    for i, hs in enumerate(hotspots):
        if not isinstance(hs, dict):
            errors.append(f"hotspots[{i}] must be an object")
            continue

        hs_id = str(hs.get("id", "")).strip()
        name = str(hs.get("name", "")).strip()
        lat = hs.get("lat")
        lon = hs.get("lon")
        weight = hs.get("weight")

        if not hs_id:
            errors.append(f"hotspots[{i}].id is missing/empty")
        elif hs_id in seen_ids:
            errors.append(f"duplicate hotspot id: {hs_id}")
        else:
            seen_ids.add(hs_id)

        if not name or name.startswith("HOTSPOT_NAME_"):
            errors.append(f"{hs_id or f'hotspots[{i}]'} has missing placeholder name")

        if lat is None or lon is None:
            errors.append(f"{hs_id or f'hotspots[{i}]'} has missing lat/lon (null)")
        else:
            try:
                float(lat)
                float(lon)
            except Exception:
                errors.append(f"{hs_id or f'hotspots[{i}]'} has non-numeric lat/lon")

        try:
            w = float(weight)
            if w <= 0:
                errors.append(f"{hs_id or f'hotspots[{i}]'} has non-positive weight")
        except Exception:
            errors.append(f"{hs_id or f'hotspots[{i}]'} has invalid weight")

    return errors


def hotspots_to_dataframe(cfg: dict[str, Any]):
    """Convert hotspots list to a pandas DataFrame (for plotting/inspection)."""
    import pandas as pd  # local import to keep module lightweight

    hotspots = cfg.get("hotspots", [])
    rows = []
    for hs in hotspots:
        rows.append(
            {
                "id": hs.get("id"),
                "name": hs.get("name"),
                "lat": hs.get("lat"),
                "lon": hs.get("lon"),
                "weight": hs.get("weight"),
                "notes": hs.get("notes", ""),
            }
        )
    return pd.DataFrame(rows)
