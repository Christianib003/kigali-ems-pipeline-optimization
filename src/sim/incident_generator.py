"""
Incident generation utilities.

Creates synthetic emergency incidents using a mix of:
- hotspot-based sampling (empirical prior)
- uniform sampling across the city (generalization)

Keep logic here so notebooks stay clean and reproducible.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np


@dataclass
class Incident:
    """A single synthetic incident record."""

    incident_id: int
    ts_min: int
    hotspot_id: str | None
    region_id: str | None
    node_id: int
    lat: float
    lon: float
    severity: str


def _rng(seed: int | None) -> np.random.Generator:
    """Create a numpy RNG (reproducible when seed is set)."""
    return np.random.default_rng(seed)


def sample_severity(rng: np.random.Generator) -> str:
    """
    Sample a simple categorical severity.

    Keep this lightweight and adjustable later.
    """
    labels = ["low", "medium", "high"]
    probs = [0.60, 0.30, 0.10]
    return str(rng.choice(labels, p=probs))


def sample_time_minute(rng: np.random.Generator, horizon_min: int) -> int:
    """
    Sample an incident time as minute index within [0, horizon_min).

    Uses a simple time-of-day weighting to mimic peak hours.
    """
    # For now: 2-peak pattern using a simple piecewise weighting
    # You can tune these weights later.
    t = rng.integers(0, horizon_min)
    return int(t)


def choose_location(
    rng: np.random.Generator,
    hotspots: list[dict[str, Any]],
    all_nodes: list[dict[str, Any]],
    hotspot_fraction: float = 0.8,
) -> dict[str, Any]:
    """
    Choose an incident location.

    With probability `hotspot_fraction`, choose from hotspots (weighted by hotspot weight).
    Otherwise choose uniformly from all_nodes.
    """
    if not (0.0 <= hotspot_fraction <= 1.0):
        raise ValueError("hotspot_fraction must be in [0, 1]")

    use_hotspot = rng.random() < hotspot_fraction

    if use_hotspot and hotspots:
        weights = np.array([float(h.get("weight", 1.0)) for h in hotspots], dtype=float)
        weights = np.clip(weights, 1e-6, None)
        probs = weights / weights.sum()
        idx = int(rng.choice(len(hotspots), p=probs))
        return hotspots[idx]

    # fallback uniform sample
    idx = int(rng.integers(0, len(all_nodes)))
    return all_nodes[idx]


def generate_incidents(
    n: int,
    hotspots: list[dict[str, Any]],
    all_nodes: list[dict[str, Any]],
    horizon_min: int,
    seed: int | None = 42,
    hotspot_fraction: float = 0.8,
) -> list[Incident]:
    """
    Generate a list of synthetic incidents.

    Returns Incident objects (convert to DataFrame in notebook for analysis).
    """
    rng = _rng(seed)
    incidents: list[Incident] = []

    for i in range(n):
        loc = choose_location(
            rng=rng,
            hotspots=hotspots,
            all_nodes=all_nodes,
            hotspot_fraction=hotspot_fraction,
        )

        ts_min = sample_time_minute(rng, horizon_min=horizon_min)
        sev = sample_severity(rng)

        incidents.append(
            Incident(
                incident_id=i + 1,
                ts_min=ts_min,
                hotspot_id=str(loc.get("id")) if loc.get("id") is not None else None,
                region_id=loc.get("region_id"),
                node_id=int(loc["node_id"]),
                lat=float(loc["lat"]),
                lon=float(loc["lon"]),
                severity=sev,
            )
        )

    return incidents
