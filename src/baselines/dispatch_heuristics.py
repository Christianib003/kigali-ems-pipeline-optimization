import random
import math
import logging
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class BaselineDispatchers:
    """
    Standard heuristic algorithms for ambulance dispatch. 
    Used to benchmark the performance of the Reinforcement Learning agents.
    """
    
    @staticmethod
    def _get_available_fleet(fleet: List[Dict]) -> List[Dict]:
        """Filters the fleet to return only ambulances currently marked as available."""
        return [amb for amb in fleet if amb['available']]

    @staticmethod
    def random_dispatch(incident: Dict, fleet: List[Dict], seed: int = 42) -> Optional[str]:
        """
        Baseline 1: Randomly assigns any available ambulance.
        Used as the absolute bottom-tier benchmark.
        """
        available_ambulances = BaselineDispatchers._get_available_fleet(fleet)
        if not available_ambulances:
            return None # Queue the incident, no fleet available
            
        rng = random.Random(seed + int(incident['time'])) # Deterministic selection
        selected = rng.choice(available_ambulances)
        return selected['id']

    @staticmethod
    def nearest_idle_dispatch(incident: Dict, fleet: List[Dict]) -> Optional[str]:
        """
        Baseline 2: Assigns the geographically closest available ambulance 
        using straight-line Euclidean distance (ignoring traffic).
        """
        available_ambulances = BaselineDispatchers._get_available_fleet(fleet)
        if not available_ambulances:
            return None

        best_amb = None
        min_dist = float('inf')

        for amb in available_ambulances:
            # Euclidean distance calculation
            dist = math.sqrt((amb['x'] - incident['x'])**2 + (amb['y'] - incident['y'])**2)
            if dist < min_dist:
                min_dist = dist
                best_amb = amb['id']

        return best_amb

    @staticmethod
    def severity_priority_dispatch(incident: Dict, fleet: List[Dict], reserve_capacity: int = 2) -> Optional[str]:
        """
        Baseline 3: Dispatches the nearest ambulance, but strictly refuses to dispatch 
        the last `reserve_capacity` ambulances unless the incident is Severity 3 (Critical).
        """
        available_ambulances = BaselineDispatchers._get_available_fleet(fleet)
        if not available_ambulances:
            return None

        # If the incident is minor (Severity 1 or 2) and we are at or below reserve capacity, 
        # deny the dispatch to save the ambulance for a potential Golden Hour incident.
        if incident['severity'] < 3 and len(available_ambulances) <= reserve_capacity:
            logging.info(f"Severity-Priority holding back dispatch for {incident['id']} (Severity {incident['severity']}). Reserving fleet.")
            return None 

        # Otherwise, fall back to nearest-idle logic
        return BaselineDispatchers.nearest_idle_dispatch(incident, fleet)