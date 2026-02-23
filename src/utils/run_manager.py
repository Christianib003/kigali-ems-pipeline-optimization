import os
from datetime import datetime
from pathlib import Path
import yaml

class RunManager:
    """
    Manages directory creation and artifact storage for experiment runs.
    """
    def __init__(self, category: str, tag: str = "default"):
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.run_id = f"{self.timestamp}_{tag}"
        self.run_dir = Path("runs") / category / self.run_id
        
        # Create subdirectories
        self.artifact_dir = self.run_dir / "artifacts"
        self.log_dir = self.run_dir / "logs"
        
        self.run_dir.mkdir(parents=True, exist_ok=True)
        self.artifact_dir.mkdir(exist_ok=True)
        self.log_dir.mkdir(exist_ok=True)

    def save_config(self, config: dict):
        """Saves a dictionary as a YAML file in the run directory."""
        with open(self.run_dir / "config.yaml", "w") as f:
            yaml.dump(config, f)
        print(f"Config saved to {self.run_dir}/config.yaml")

    def get_path(self, filename: str) -> Path:
        """Returns a path inside the artifact directory."""
        return self.artifact_dir / filename