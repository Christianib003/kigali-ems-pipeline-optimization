"""
I/O utilities for resumable pipelines.

Keep these helpers reusable across notebooks and scripts.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd


def get_last_incident_id(csv_path: Path) -> int:
    """
    Return the last incident_id in an existing CSV, or 0 if file doesn't exist.

    This enables resume-safe generation.
    """
    if not csv_path.exists():
        return 0

    # Read only the last few rows (fast enough for our scale)
    df = pd.read_csv(csv_path)
    if df.empty or "incident_id" not in df.columns:
        return 0

    return int(df["incident_id"].max())


def append_dataframe(csv_path: Path, df: pd.DataFrame) -> None:
    """
    Append a DataFrame to CSV. Creates the file if needed.
    """
    if df.empty:
        return

    header = not csv_path.exists()
    df.to_csv(csv_path, mode="a", header=header, index=False)
