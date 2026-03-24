import traci
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class SimulationManager:
    """
    Manages the lifecycle of the SUMO simulation via TraCI.
    Includes built-in safeguards to prevent port collisions in Jupyter environments.
    """
    def __init__(self, net_path: str | Path, route_path: str | Path, use_gui: bool = False):
        self.net_path = Path(net_path)
        self.route_path = Path(route_path)
        self.use_gui = use_gui
        
        # Select the executable
        self.sumo_binary = "sumo-gui" if self.use_gui else "sumo"

    def start(self) -> None:
        """Starts the SUMO engine and establishes the TraCI connection."""
        
        # CRITICAL SAFEGUARD: If a previous notebook run crashed, TraCI might still be attached to the port.
        # This forcefully closes any lingering connections before starting a new one.
        try:
            traci.close()
            logging.info("Closed lingering TraCI connection.")
        except traci.exceptions.FatalTraCIError:
            pass # No existing connection, which is fine.

        # Configure the simulation parameters
        sumo_cmd = [
            self.sumo_binary,
            "-n", str(self.net_path),
            "-r", str(self.route_path),
            "--step-length", "1.0",          # Advance 1 second per step
            "--no-step-log", "true",         # Suppresses spammy terminal output
            "--waiting-time-memory", "10000", # Keeps vehicle wait times in memory (crucial for RL state formulation)
            "--ignore-route-errors", "true"
        ]
        
        logging.info("Starting SUMO Simulation Engine...")
        traci.start(sumo_cmd)

    def step(self) -> None:
        """Advances the simulation by exactly one time step."""
        traci.simulationStep()

    def get_time(self) -> float:
        """Returns the current simulation time in seconds."""
        return traci.simulation.getTime()

    def close(self) -> None:
        """Gracefully shuts down the TraCI connection and the SUMO binary."""
        try:
            traci.close()
            logging.info("SUMO simulation closed cleanly.")
        except traci.exceptions.FatalTraCIError:
            logging.warning("TraCI was already closed or encountered an error during shutdown.")