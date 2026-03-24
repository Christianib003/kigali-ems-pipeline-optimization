This is a highly professional and robust approach to structuring the project. Separating core logic into reusable Python modules (`.py` files) while using Jupyter Notebooks strictly for orchestration, training execution, and visualization is the industry standard for machine learning engineering. 

Here is the comprehensive, granular backlog tailored for your GitHub Projects board, incorporating strict resumability, modularity, the specified baseline policies, and deployment phases.

---

### Phase 1: Environment Setup & Data Pipeline

**Milestone 1.1: Project Infrastructure & Core Modules**

* **Task 1: Workspace Initialization & Directory Architecture**
    * *Description:* Establish the foundational repository structure, ensuring a strict separation between reusable source code and experimental notebooks.
    * Initialize the Git repository and set up `.gitignore` for data, model weights, and environment variables.
    * Define the directory structure: `src/` (for modular `.py` files), `notebooks/` (for orchestration), `data/` (raw and processed), `models/` (checkpoints), and `logs/`.
    * [cite_start]Create a `requirements.txt` locking core dependencies: Python 3.10 [cite: 428][cite_start], PyTorch [cite: 430][cite_start], SUMO tools [cite: 429][cite_start], GeoPandas [cite: 431][cite_start], OSMNX [cite: 431][cite_start], Matplotlib [cite: 432][cite_start], and Streamlit[cite: 432].

* **Task 2: Resumable Data Acquisition Logic**
    * *Description:* Develop modular Python scripts in `src/data_fetcher.py` to download mapping and population data, strictly preventing redundant network calls.
    * [cite_start]Implement an OSMNX function to download OpenStreetMap data for Kigali[cite: 60], specifically checking if a local `.graphml` file exists before executing the API call.
    * [cite_start]Implement a function to fetch WorldPop density data[cite: 60], caching it locally as a GeoTIFF or CSV.

**Milestone 1.2: The Digital Twin Construction**

* **Task 3: SUMO Network Conversion & Validation Notebook**
    * *Description:* Create `notebooks/01_network_generation.ipynb` to orchestrate the conversion of OSM data into a playable SUMO environment.
    * Import network conversion utilities from `src/`.
    * Execute SUMO's `netconvert` command programmatically to generate the `.net.xml` file.
    * Run topological validation scripts to identify and prune isolated edges or disconnected intersections.

* **Task 4: Deterministic Background Traffic Generation**
    * *Description:* Generate a realistic, reproducible baseline of non-emergency urban traffic representing Kigali's peak-hour conditions.
    * [cite_start]Write a script using SUMO's `randomTrips.py` to simulate approximately 5,000 background vehicles[cite: 250].
    * Save the generated routes as an `.rou.xml` file to ensure the exact same traffic conditions are loaded during every evaluation epoch to maintain consistent benchmarking.

---

### Phase 2: Simulation Components & Baselines

**Milestone 2.1: Demand Modeling & Environment APIs**

* **Task 5: Stochastic Incident Generator**
    * [cite_start]*Description:* Build the Tier 1 Incident Generator [cite: 215] in `src/environment/incident_gen.py` to trigger emergencies based on cached population data.
    * [cite_start]Map WorldPop density weights [cite: 224] to specific network edges.
    * [cite_start]Create an `Incident` class yielding objects with severity, coordinates, and timestamps[cite: 299].
    * Implement a seeding mechanism ensuring incident generation is perfectly reproducible across different notebook runs.

* **Task 6: Dynamic Hospital Queuing Logic**
    * [cite_start]*Description:* Implement the Tier 4 hospital module [cite: 219] in `src/environment/hospital.py` to calculate expected Emergency Department (ED) wait times.
    * [cite_start]Create the `Hospital` class with state variables for capacity (bays) and current load[cite: 302, 304].
    * Implement a queuing theory function to output real-time estimated wait times.
    * [cite_start]Build the `Time-to-Care` calculator [cite: 323] that sums the SUMO travel time and the expected ED wait time.

* **Task 7: The Python-SUMO TraCI Bridge**
    * [cite_start]*Description:* Establish the `SimulationManager` in `src/environment/manager.py` to handle bidirectional communication between Python and the SUMO engine[cite: 305].
    * [cite_start]Implement the `sync_traci_bridge()` method [cite: 277] to advance the simulation cleanly without memory leaks.
    * [cite_start]Write state-extraction functions to pull vehicle positions, route data, and traffic light phases at each step via the TraCI API[cite: 318, 424].

**Milestone 2.2: Baseline Policy Implementation**

* **Task 8: Heuristic Dispatch & Control Baselines**
    * *Description:* Develop the standard baseline algorithms in `src/baselines/` to compare against the Reinforcement Learning agents later.
    * Implement **Nearest-Idle**: Assigns the geographically closest available vehicle.
    * Implement **Random-Idle**: Randomly assigns an available vehicle (stress-testing standard).
    * Implement **Severity-Priority**: Assigns vehicles based strictly on incident severity tiers, ignoring traffic states.
    * Implement fixed-time (static) traffic signal control logic as the baseline for intersection management.

---

### Phase 3: Intelligence Tier (Reinforcement Learning)

**Milestone 3.1: Intelligent Dispatch Agent (DQN)**

* **Task 9: DQN Architecture & State-Action Definitions**
    * [cite_start]*Description:* Define the Deep Q-Network in `src/agents/dispatch_dqn.py` to assign vehicles based on global fleet coverage[cite: 422].
    * Define the PyTorch neural network architecture.
    * Map the state vector (fleet locations, hospital loads, incident coordinates).
    * Design the reward function (e.g., negative penalty for high Total Time-to-Care).

* **Task 10: Resumable DQN Training Notebook**
    * *Description:* Create `notebooks/02_train_dispatch.ipynb` to execute the training loop with strict state-saving protocols.
    * Implement the replay buffer and exploration/exploitation logic.
    * Add automated callback logic to save model weights (`.pt`) to the `models/` directory every $N$ episodes.
    * Write initialization checks to load existing checkpoints automatically if the notebook is interrupted and restarted.

**Milestone 3.2: Traffic Signal Control (MARL)**

* **Task 11: MARL Environment & Agent Formulation**
    * [cite_start]*Description:* Formulate the decentralized actor-critic architecture in `src/agents/signal_marl.py` to manage intersection phases[cite: 423].
    * [cite_start]Define the local state for each `TrafficSignalAgent` (e.g., queue length, approaching emergency vehicle distance)[cite: 300, 301].
    * [cite_start]Map the action space for executing preemption (green waves)[cite: 236].

* **Task 12: Resumable MARL Training Notebook**
    * *Description:* Create `notebooks/03_train_signals.ipynb` to train the signal agents while monitoring network stability.
    * [cite_start]Execute training runs, utilizing TraCI to inject phase changes[cite: 424].
    * [cite_start]Implement logic to monitor and penalize the agent if background traffic delay increases by more than 12%[cite: 251].
    * Implement checkpoint saving and loading logic for the MARL weights.

---

### Phase 4: Integration, Evaluation & Visualization

**Milestone 4.1: End-to-End System Integration**

* **Task 13: Pipeline Synchronization**
    * *Description:* Connect all tiers into a unified continuous loop within `src/orchestration/pipeline.py`.
    * Ensure the `DispatchAgent` successfully updates the `EmergencyVehicle` target route.
    * Verify that the vehicle's route actively triggers the `SignalControlAgent` preemption logic downstream.

**Milestone 4.2: Comprehensive Benchmarking & Visualization**

* **Task 14: System Evaluation Notebook**
    * *Description:* Create `notebooks/04_evaluation_and_viz.ipynb` to run all policies and generate comparative analytics.
    * Run full simulation episodes using the RL policies, Nearest-idle, Random-idle, and Severity-priority baselines.
    * [cite_start]Log performance metrics, specifically focusing on the 90th percentile response times [cite: 63] and hospital load variance.
    * [cite_start]Utilize Matplotlib [cite: 432] to generate high-quality comparative charts (e.g., bar charts for time-to-care, line graphs for traffic delay impacts).

---

### Phase 5: Deployment & User Interface

**Milestone 5.1: Backend API Development**

* **Task 15: FastAPI REST Wrapper**
    * *Description:* Expose the simulation controls and pre-trained model inference through a fast, stateless API in `src/api/main.py`.
    * Initialize a FastAPI application.
    * Create a `POST /api/simulate` endpoint to trigger a simulation run with specified parameters.
    * Create a `GET /api/metrics` endpoint to fetch simulation logs and telemetry data.

**Milestone 5.2: Frontend Dashboard**

* **Task 16: Streamlit Command Center**
    * [cite_start]*Description:* Build the evaluation dashboard in `src/frontend/app.py` to visualize system decisions[cite: 432].
    * Build interactive widgets mapping the "Time-to-Care" reductions across different policies.
    * Create a dynamic view to monitor simulated real-time hospital load capacities.
    * Implement a map view (using Folium or Streamlit map components) to visualize incident hotspots and dispatch routes.

**Milestone 5.3: Containerization & Deployment**

* **Task 17: Dockerization & Orchestration**
    * *Description:* Package the environment into containers to ensure consistent execution across any infrastructure.
    * Write a `Dockerfile` for the backend, ensuring SUMO binaries and Python dependencies are correctly layered.
    * Write a `Dockerfile` for the Streamlit frontend.
    * Create a `docker-compose.yml` to orchestrate the multi-container deployment, ensuring the frontend communicates properly with the backend API.

---

This backlog gives you 17 highly specific, manageable units of work. Would you like to proceed by setting up the Git repository structure, or would you prefer to start drafting the code for **Task 2: Resumable Data Acquisition Logic**?