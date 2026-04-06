import traci
import logging
from pathlib import Path

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
        
        self.sumo_binary = "sumo-gui" if self.use_gui else "sumo"

    def start(self) -> None:
        """Starts the SUMO engine and establishes the TraCI connection."""
        
        try:
            traci.close()
            logging.info("Closed lingering TraCI connection.")
        except traci.exceptions.FatalTraCIError:
            pass

        sumo_cmd = [
            self.sumo_binary,
            "-n", str(self.net_path),
            "-r", str(self.route_path),
            "--step-length", "1.0",  
            "--no-step-log", "true",
            "--waiting-time-memory", "10000",
            "--ignore-route-errors", "true",
            "--time-to-teleport", "900"
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