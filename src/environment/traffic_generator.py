import os
import subprocess
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def generate_background_traffic(net_path: str | Path, output_rou_path: str | Path, num_vehicles: int = 5000, seed: int = 42) -> None:
    """
    Generates deterministic background traffic using SUMO's randomTrips.py.
    Strictly resumable. Uses a fixed random seed to ensure exact reproducibility 
    across different RL training epochs and baseline evaluations.
    """
    net_path = Path(net_path)
    output_rou_path = Path(output_rou_path)

    if output_rou_path.exists():
        logging.info(f"Traffic route file already exists at {output_rou_path}. Skipping generation.")
        return

    # Locate SUMO's tools directory
    if "SUMO_HOME" in os.environ:
        tools_dir = Path(os.environ["SUMO_HOME"]) / "tools"
    else:
        # Common fallback for macOS Homebrew installations
        tools_dir = Path("/opt/homebrew/opt/sumo/share/sumo/tools")
        if not tools_dir.exists():
            # Alternative Intel Mac fallback
            tools_dir = Path("/usr/local/opt/sumo/share/sumo/tools")

    random_trips_script = tools_dir / "randomTrips.py"
    
    if not random_trips_script.exists():
        raise FileNotFoundError(
            f"Could not find randomTrips.py at {random_trips_script}. "
            "Please ensure SUMO is installed and the SUMO_HOME environment variable is set."
        )

    # Calculate the insertion period to distribute num_vehicles evenly over 1 hour (3600 seconds)
    period = 3600.0 / num_vehicles

    logging.info(f"Generating ~{num_vehicles} deterministic background trips (Seed: {seed})...")
    
    # We use -r to generate routes directly (bypassing the intermediate trips file)
    cmd = [
        "python", str(random_trips_script),
        "-n", str(net_path),
        "-r", str(output_rou_path),
        "-e", "3600",           # End time (1 hour)
        "-p", str(period),      # Insertion period
        "--seed", str(seed),    # Fixed seed for reproducibility
        "--validate"            # Ensures generated routes are actually valid on our specific network
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logging.info(f"Successfully generated deterministic background traffic at {output_rou_path}")
    except subprocess.CalledProcessError as e:
        logging.error(f"randomTrips.py failed. Error: {e.stderr.decode('utf-8', errors='ignore')}")
        raise