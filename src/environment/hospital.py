import logging
from typing import List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Hospital:
    def __init__(self, hospital_id: str, name: str, edge_id: str, capacity: int, service_rate_per_hour: float):
        """
        Initializes a hospital node in the digital twin.
        
        Args:
            hospital_id: Unique identifier (e.g., 'H_CHUK').
            name: Full name of the facility.
            edge_id: The SUMO network edge where the hospital is located.
            capacity: Number of concurrent emergency trauma bays.
            service_rate_per_hour: Average number of patients treated per bay, per hour.
        """
        self.id = hospital_id
        self.name = name
        self.edge_id = edge_id
        self.capacity = capacity
        self.service_rate_per_hour = service_rate_per_hour
        
        self.current_queue = 0.0

    def estimate_wait_time(self) -> float:
        """
        Calculates the estimated wait time (in seconds) for a newly arriving patient.
        If current queue < capacity, wait time is 0.
        Otherwise, calculates time to clear the backlog ahead of them.
        """
        if self.current_queue < self.capacity:
            return 0.0
        
        clearance_rate_per_second = (self.capacity * self.service_rate_per_hour) / 3600.0
        
        backlog = self.current_queue - self.capacity + 1 
        wait_seconds = backlog / clearance_rate_per_second
        
        return wait_seconds

    def admit_patient(self) -> None:
        """Adds a patient to the hospital's current load."""
        self.current_queue += 1.0

    def process_queue(self, elapsed_seconds: float) -> None:
        """
        Simulates the passing of time, treating and discharging patients.
        This will be called at every step of the SUMO simulation.
        """
        if self.current_queue > 0:
            active_treatments = min(self.current_queue, self.capacity)
            clearance_rate_per_second = (active_treatments * self.service_rate_per_hour) / 3600.0
            
            cleared_patients = clearance_rate_per_second * elapsed_seconds
            self.current_queue = max(0.0, self.current_queue - cleared_patients)

    def reset(self, initial_load: float = 0.0) -> None:
        """Resets the hospital state for a new simulation episode."""
        self.current_queue = initial_load

def calculate_time_to_care(travel_time_seconds: float, hospital: Hospital) -> float:
    """
    The core metric for our RL Reward Function.
    Total Time-to-Care = Drive Time + ED Wait Time.
    """
    return travel_time_seconds + hospital.estimate_wait_time()