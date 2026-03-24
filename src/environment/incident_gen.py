import json
import random
import logging
import math
import sumolib
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@dataclass
class Incident:
    id: str
    time: float
    edge_id: str
    x: float
    y: float
    severity: int

class StochasticIncidentGenerator:
    """
    Generates deterministic emergency incidents based on spatial hotspots and 
    severity distributions derived from Patel et al. (2016) Kigali RTI research.
    """
    SEVERITY_LEVELS = [1, 2, 3]
    SEVERITY_WEIGHTS = [0.55, 0.30, 0.15] # 15% critical, 30% severe, 55% minor

    # High-risk spatial clusters (Longitude, Latitude)
    HOTSPOTS = [
        {"name": "Nyabugogo Bus Park Area", "coords": (30.044, -1.939), "radius_m": 1500, "multiplier": 4.0},
        {"name": "Giporoso / Remera", "coords": (30.112, -1.958), "radius_m": 1200, "multiplier": 3.0},
        {"name": "CBD / KN 3 Ave", "coords": (30.060, -1.944), "radius_m": 1000, "multiplier": 2.5}
    ]

    def __init__(self, net_path: str | Path, seed: int = 42):
        self.net_path = Path(net_path)
        self.seed = seed
        self.net = None
        self.rng = random.Random(self.seed)

    def _get_edge_weights(self) -> tuple[List[str], List[float], dict]:
        if self.net is None:
            self.net = sumolib.net.readNet(str(self.net_path))

        # 1. Convert hotspot GPS coordinates to SUMO X/Y map coordinates
        projected_hotspots = []
        for hs in self.HOTSPOTS:
            hx, hy = self.net.convertLonLat2XY(hs["coords"][0], hs["coords"][1])
            projected_hotspots.append({
                "x": hx,
                "y": hy,
                "radius_m": hs["radius_m"],
                "multiplier": hs["multiplier"]
            })

        valid_edges = []
        weights = []
        edge_centers = {}

        logging.info("Calculating spatial probability weights for network edges...")
        for edge in self.net.getEdges():
            if edge.allows("passenger") and not edge.isSpecial():
                edge_id = edge.getID()
                
                # 2. SUMO edge shapes are ALREADY in internal X/Y format (meters)
                shape = edge.getShape()
                center_x = sum(p[0] for p in shape) / len(shape)
                center_y = sum(p[1] for p in shape) / len(shape)
                
                weight = edge.getLength()
                
                # 3. Apply Hotspot Multipliers using pure Euclidean metric distance
                for hs in projected_hotspots:
                    dist = math.sqrt((center_x - hs["x"])**2 + (center_y - hs["y"])**2)
                    if dist <= hs["radius_m"]:
                        decay = 1.0 - (dist / hs["radius_m"])
                        weight *= (1.0 + (hs["multiplier"] * decay))

                valid_edges.append(edge_id)
                weights.append(weight)
                
                # Save the physical metric coordinates
                edge_centers[edge_id] = {"x": center_x, "y": center_y}

        return valid_edges, weights, edge_centers

    def generate(self, output_path: str | Path, num_incidents: int = 30, duration_seconds: int = 3600) -> None:
        output_path = Path(output_path)
        
        # Resumability check: delete the file to force regeneration
        if output_path.exists():
            logging.info(f"Incident schedule already exists at {output_path}. Skipping generation.")
            return

        logging.info(f"Generating {num_incidents} stochastic incidents (Seed: {self.seed})...")
        edges, weights, edge_centers = self._get_edge_weights()
        
        incidents = []
        for i in range(num_incidents):
            selected_edge = self.rng.choices(edges, weights=weights, k=1)[0]
            severity = self.rng.choices(self.SEVERITY_LEVELS, weights=self.SEVERITY_WEIGHTS, k=1)[0]
            incident_time = self.rng.uniform(0, duration_seconds)
            
            inc_obj = Incident(
                id=f"INC_{i:03d}",
                time=round(incident_time, 1),
                edge_id=selected_edge,
                x=round(edge_centers[selected_edge]["x"], 2),
                y=round(edge_centers[selected_edge]["y"], 2),
                severity=severity
            )
            incidents.append(inc_obj)

        incidents.sort(key=lambda x: x.time)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump([asdict(inc) for inc in incidents], f, indent=4)
            
        logging.info(f"Successfully saved incident schedule to {output_path}")