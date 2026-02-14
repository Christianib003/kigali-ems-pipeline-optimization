"""
SUMO Simulation Manager.

Provides a small, reusable wrapper around TraCI to:
- start a SUMO simulation (GUI or CLI)
- step through time
- read basic information
- close cleanly

Keep this module simple and notebook-friendly.
"""

from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path

import traci


@dataclass
class SumoConfig:
    """Runtime configuration for starting SUMO."""

    use_gui: bool = False
    step_length: float = 1.0
    seed: int = 42
    sumo_bin: str | None = None
    sumo_gui_bin: str | None = None


class SimulationManager:
    """
    Wraps TraCI lifecycle: start -> step -> close.

    This class does not build routes/networks. It only runs an existing SUMO config.
    """

    def __init__(self, config: SumoConfig, sumocfg_path: Path) -> None:
        """
        Args:
            config: SUMO runtime settings (gui, step length, seed).
            sumocfg_path: Path to a SUMO .sumocfg file.
        """
        self.config = config
        self.sumocfg_path = Path(sumocfg_path)
        self._started = False

    def _resolve_sumo_binary(self) -> str:
        """Resolve the SUMO binary path (sumo or sumo-gui)."""
        if self.config.use_gui:
            if self.config.sumo_gui_bin:
                return self.config.sumo_gui_bin
            bin_name = "sumo-gui"
        else:
            if self.config.sumo_bin:
                return self.config.sumo_bin
            bin_name = "sumo"

        resolved = shutil.which(bin_name)
        if not resolved:
            raise RuntimeError(f"{bin_name} not found on PATH. Check your SUMO installation.")
        return resolved

    def start(self) -> None:
        """Start SUMO and connect TraCI."""
        if self._started:
            print("[WARN] Simulation already started.")
            return

        if not self.sumocfg_path.exists():
            raise FileNotFoundError(f"Missing SUMO config: {self.sumocfg_path}")

        sumo_binary = self._resolve_sumo_binary()

        cmd = [
            sumo_binary,
            "-c",
            str(self.sumocfg_path),
            "--step-length",
            str(self.config.step_length),
            "--seed",
            str(self.config.seed),
        ]

        print("## Starting SUMO")
        print("Binary:", sumo_binary)
        print("Config :", self.sumocfg_path)
        print("Cmd    :", " ".join(cmd))

        # TraCI starts SUMO as a subprocess and connects
        traci.start(cmd)
        self._started = True
        print("[OK] TraCI connected.")

    def step(self, n_steps: int = 1) -> None:
        """Advance the simulation by n_steps."""
        if not self._started:
            raise RuntimeError("Simulation not started. Call start() first.")

        for _ in range(int(n_steps)):
            traci.simulationStep()

    def get_sim_time(self) -> float:
        """Return the current simulation time in seconds."""
        if not self._started:
            raise RuntimeError("Simulation not started.")
        return float(traci.simulation.getTime())

    def close(self) -> None:
        """Close TraCI connection and SUMO process."""
        if not self._started:
            print("[WARN] Simulation not started (nothing to close).")
            return

        print("## Closing TraCI")
        try:
            traci.close()
            print("[OK] TraCI closed.")
        finally:
            self._started = False
