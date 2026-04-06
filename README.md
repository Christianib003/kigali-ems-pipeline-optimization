# Kigali EMS — Multi-Agent Reinforcement Learning for Emergency Dispatch

A research-grade simulation platform that applies **Deep Q-Networks (DQN)** and **Multi-Agent Reinforcement Learning (MARL)** to optimise emergency medical service dispatch and traffic signal control across Kigali, Rwanda. The system is built on a full digital twin of the Kigali road network derived from OpenStreetMap, simulated with SUMO (Simulation of Urban MObility), and deployed through a live FastAPI backend with a React dashboard.

This project was developed as an academic capstone in partial fulfilment of a Bachelor of Science degree in Software Engineering.

## Table of Contents

- [System Overview](#system-overview)
- [Key Features](#key-features)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Running the Notebooks](#running-the-notebooks)
- [Training the Models](#training-the-models)
- [Evaluation](#evaluation)
- [Live Server & Dashboard](#live-server--dashboard)
- [Architecture](#architecture)
- [Model Details](#model-details)
- [Benchmark Results](#benchmark-results)
- [Configuration Reference](#configuration-reference)
- [Acknowledgements](#acknowledgements)

## System Overview

Emergency response time is one of the strongest predictors of patient survival in trauma and cardiac events. In a rapidly urbanising city like Kigali, a growing population, dense road network, and a limited ambulance fleet make optimal dispatch a genuinely hard combinatorial problem. Static rule-based protocols — dispatch the nearest idle unit — ignore real-time hospital congestion, dynamic traffic, and incident severity.

This platform addresses that gap by training two cooperative AI agents:

- **Dispatch DQN** — a Deep Q-Network that decides *which ambulance* to send to each incoming incident, learning to minimise the total time-to-care (drive time + emergency department wait time).
- **Traffic MARL** — a parameter-shared Multi-Agent Q-Learning controller that manages traffic signal phases citywide, prioritising green waves for approaching emergency vehicles.

Both agents are trained offline in a headless SUMO simulation of Kigali and evaluated against three heuristic baselines: random dispatch, nearest-idle dispatch, and severity-priority dispatch.

## Key Features

- Full digital twin of the Kigali road network (65 MB SUMO `.net.xml` built from OpenStreetMap)
- Stochastic incident generation grounded in Kigali road-traffic injury hotspot data
- Dynamic hospital queuing model based on real ED throughput rates (MINISANTE 2022/23)
- DQN dispatch agent with normalised continuous state space and shaped reward function
- MARL traffic controller using Independent Q-Learning with parameter sharing across all signalised intersections
- Resumable training loops — checkpoints are saved and automatically reloaded
- Full benchmark suite comparing AI policies against three heuristics across low- and high-demand scenarios
- Live FastAPI backend with WebSocket support for real-time simulation streaming
- React dashboard for operator situational awareness
- Training stability visualisations: reward curves, loss curves, epsilon decay, hyperparameter sensitivity

## Repository Structure

```
ems-marl/
├── data/
│   └── processed/
│       ├── kigali.net.xml                  Full 65 MB SUMO road network
│       ├── kigali_connected.net.xml        Simplified connected subgraph (evaluation)
│       ├── kigali.osm.xml                  OpenStreetMap intermediate format
│       ├── kigali_traffic.rou.xml          Background vehicle routes (training)
│       ├── kigali_connected_traffic.rou.xml Background routes (evaluation)
│       ├── incidents_seed42.json           30 deterministic incidents (training)
│       └── incidents_high_stress.json      180-incident high-demand scenario (eval)
│
├── notebooks/
│   ├── 00_data_acquisition.ipynb          Download OSM network and WorldPop data
│   ├── 01_data_extraction.ipynb           Convert OSM → SUMO, generate incidents
│   ├── 01_network_generation.ipynb        SUMO network validation and visualisation
│   ├── 02_simulatioin_components.ipynb    Test simulation, hospitals, baselines
│   ├── 03_train_dispatch.ipynb            Train DQN dispatch agent
│   ├── 04_train_traffic.ipynb             Train MARL traffic controller
│   └── 05_evaluate_system.ipynb           Benchmark all policies, generate figures
│
├── src/
│   ├── environment/
│   │   ├── manager.py                     SUMO/TraCI lifecycle manager
│   │   ├── incident_gen.py                Stochastic incident generator
│   │   ├── hospital.py                    Hospital queuing model
│   │   ├── network_builder.py             OSM → SUMO network conversion
│   │   └── traffic_generator.py           Background traffic generation
│   ├── agents/
│   │   ├── dispatch_dqn.py                DQN agent (policy net, replay buffer)
│   │   └── traffic_marl.py                MARL traffic controller (shared network)
│   └── baselines/
│       └── dispatch_heuristics.py         Random, Nearest-Idle, Severity-Priority
│
├── models/                                Saved model weights (generated at runtime)
│   ├── dqn_dispatch_v1.pt
│   └── marl_traffic_v1.pt
│
├── figures/                               Output visualisations from notebooks
├── kigali-ems-ui/                         React operator dashboard
├── live_server.py                         FastAPI + WebSocket live simulation server
├── requirements.txt                       Python dependencies
└── ems_history.db                         SQLite dispatch history (generated at runtime)
```

## Prerequisites

### System-Level Dependencies

The simulation layer depends on **SUMO (Simulation of Urban MObility)**. It must be installed before any Python packages.

**macOS (Homebrew)**
```bash
brew install sumo
```

**Ubuntu / Debian**
```bash
sudo add-apt-repository ppa:sumo/stable
sudo apt-get update
sudo apt-get install sumo sumo-tools sumo-doc
```

**Windows**

Download and run the official installer from [sumo.dlr.de/docs/Downloads.php](https://sumo.dlr.de/docs/Downloads.php). After installation, add the SUMO `bin/` directory to your `PATH` and set the `SUMO_HOME` environment variable:

```powershell
setx SUMO_HOME "C:\Program Files (x86)\Eclipse\Sumo"
setx PATH "%PATH%;%SUMO_HOME%\bin"
```

Verify the installation:
```bash
sumo --version
# Eclipse SUMO sumo Version 1.19.x
```

**Important:** The `SUMO_HOME` environment variable must point to your SUMO installation for the Python `traci` and `sumolib` bindings to locate the standard tool scripts.

```bash
export SUMO_HOME=/usr/share/sumo          # Linux (add to ~/.bashrc)
export SUMO_HOME=/opt/homebrew/share/sumo # macOS Homebrew
```

### Python

Python **3.11 or 3.12** is required. Python 3.10 may work but is untested against the current dependency versions. You can check your version with `python3 --version`.

### Node.js (dashboard only)

Node.js **18 or later** is required to build and run the React dashboard. Download from [nodejs.org](https://nodejs.org) or install via a version manager such as `nvm`.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ems-marl.git
cd ems-marl
```

### 2. Create a virtual environment

Using a virtual environment is strongly recommended to isolate dependencies from your system Python.

```bash
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows PowerShell
```

### 3. Install Python dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

The key packages installed are:

| Package | Purpose |
|---------|---------|
| `torch >= 2.0` | DQN and MARL neural networks |
| `numpy`, `scipy` | Numerical computation |
| `pandas`, `geopandas` | Data manipulation and geospatial operations |
| `osmnx >= 1.6` | OpenStreetMap network download and conversion |
| `sumolib`, `traci >= 1.18` | SUMO Python bindings |
| `matplotlib`, `seaborn` | Visualisation |
| `fastapi`, `uvicorn`, `websockets` | Live server backend |

> **Apple Silicon (M1/M2/M3):** PyTorch will automatically detect and use the Metal Performance Shaders (MPS) backend for GPU-accelerated training. No additional configuration is required.

> **CUDA (NVIDIA):** Install the CUDA-enabled PyTorch build from [pytorch.org](https://pytorch.org/get-started/locally/) and replace the `torch` line in `requirements.txt` accordingly before running `pip install`.

### 4. Register the Jupyter kernel

If you plan to run the notebooks inside VS Code, JupyterLab, or another interface, register the virtual environment as a kernel:

```bash
pip install ipykernel
python3 -m ipykernel install --user --name ems-marl --display-name "EMS-MARL (venv)"
```

Then select the `EMS-MARL (venv)` kernel when opening any notebook.

### 5. Install the React dashboard dependencies (optional)

The React dashboard is only needed for the live operational interface. It is not required to run the training and evaluation notebooks.

```bash
cd kigali-ems-ui
npm install
cd ..
```

## Running the Notebooks

The notebooks are designed to be executed in numerical order. Each notebook persists its outputs (processed data files, model weights, incident schedules) to disk, and the next notebook reads from those outputs. All components include resumability guards — if an output file already exists, the generation step is skipped automatically.

```
00 → 01 → 02 → 03 → 04 → 05
```

Open Jupyter from the repository root:

```bash
jupyter lab
# or: jupyter notebook
```

Then navigate to the `notebooks/` directory and open each file.

### Notebook Descriptions

**`00_data_acquisition.ipynb`**
Downloads the Kigali road network for three districts (Nyarugenge, Gasabo, Kicukiro) from OpenStreetMap and fetches WorldPop population density rasters. Requires an internet connection on first run. Outputs are cached to `data/raw/`.

**`01_data_extraction.ipynb`**
Converts the raw OSM graph to a validated SUMO `.net.xml` road network using `netconvert`. Generates a seeded incident schedule of 10,000 synthetic road-traffic incidents snapped to network edges, and maps eight Kigali hospitals to their nearest network nodes. Produces the primary spatial visualisation overlaying roads, incidents, and hospitals.

**`01_network_generation.ipynb`**
Validates the generated SUMO network topology, checks for isolated components, and produces diagnostic visualisations of lane connectivity and traffic light placement.

**`02_simulatioin_components.ipynb`**
Integration test for all simulation components. Runs a 10-step SUMO simulation loop, exercises the hospital queuing model, and runs all three baseline dispatch heuristics to confirm the pipeline is operational end-to-end.

**`03_train_dispatch.ipynb`**
Trains the DQN dispatch agent over 10,000 episodes. After training, produces a 3-panel reward curve showing raw episode rewards, smoothed moving average, Huber loss convergence, and epsilon decay. Also includes a hyperparameter sensitivity analysis table and bar chart covering learning rate, replay buffer capacity, epsilon decay rate, and discount factor.

**`04_train_traffic.ipynb`**
Trains the MARL traffic signal controller over 50 simulation episodes using Independent Q-Learning with a shared network. Produces episode reward and epsilon decay plots after training.

**`05_evaluate_system.ipynb`**
Full benchmark evaluation. Runs all four policies (Random-Idle, Nearest-Idle, Severity-Priority, DQN-MARL) over a one-hour simulated shift with 180 incidents. Produces:
- Extended lifecycle metrics table
- P90 response time bar chart
- Fleet utilisation bar chart
- Response time distribution violin plot
- Ambulance status breakdown stacked bar chart
- Kigali spatial map with hospital markers, incident cloud, and sample DQN-MARL dispatch routes
- Response time heatmap broken down by severity tier and policy

## Training the Models

Training runs entirely inside the notebooks and does not require a separate script. The key parameters are defined as constants at the top of each training cell:

**DQN Dispatch Agent** (`03_train_dispatch.ipynb`)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Episodes | 10,000 | Each episode processes all 30 daily incidents |
| Learning rate | 1e-3 | Selected by one-at-a-time ablation study |
| Discount factor γ | 0.99 | Long-horizon reward attribution |
| Replay buffer | 10,000 transitions | Best balance of stability and memory |
| Epsilon decay | 0.995 per episode | ε: 1.0 → 0.05 |
| Batch size | 64 | Sampled from replay buffer |
| Target network sync | Every 10 episodes | Hard update |

**MARL Traffic Controller** (`04_train_traffic.ipynb`)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Episodes | 50 | Each episode is 1,000 SUMO steps |
| Learning rate | 1e-3 | |
| Discount factor γ | 0.95 | Shorter horizon for signal timing |
| Shared replay buffer | 50,000 transitions | All intersections write to one pool |
| Epsilon decay | 0.99 per episode | ε: 1.0 → 0.05 |
| Batch size | 128 | |
| Decision interval | Every 5 steps | Intersection re-evaluation cadence |

Both training loops are fully **resumable**. If a model checkpoint already exists in `models/`, the agent loads those weights and continues from where it left off. To restart from scratch, delete the corresponding `.pt` file:

```bash
rm models/dqn_dispatch_v1.pt
rm models/marl_traffic_v1.pt
```

Trained weights are saved only when a new best episode reward is achieved.

## Evaluation

Run notebook `05_evaluate_system.ipynb` after both models have been trained. All figures are automatically exported to the `figures/` directory:

```
figures/
├── 03_reward_curve_dqn.png
├── 03_hyperparameter_sensitivity.png
├── 04_reward_curve_marl.png
├── 05_kigali_map.png
└── 05_severity_response_time.png
```

## Live Server & Dashboard

The live server runs a continuous SUMO simulation loop, dispatches ambulances using the trained DQN agent, and streams telemetry to connected clients over WebSockets.

### Start the backend

Ensure the trained model weights and processed data files are present, then:

```bash
# From the repository root, with the virtual environment activated
python live_server.py
```

The server starts on `http://0.0.0.0:8000`. Available endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `GET /api/history` | REST | Returns all past dispatch logs from SQLite |
| `WS /ws/controller/{client_id}` | WebSocket | God-mode view: full global state every simulation step |
| `WS /ws/ambulance/{amb_id}` | WebSocket | Individual ambulance terminal: status, incident details, live ETA |
| `WS /ws/hospital/{hosp_id}` | WebSocket | Hospital receiving board: queue depth and incoming patient list |

### Start the React dashboard

```bash
cd kigali-ems-ui
npm start
```

The dashboard opens at `http://localhost:3000` and connects to the backend WebSocket automatically. It provides an operator situational awareness view with real-time ambulance positions, incident markers, and hospital queue status.

### Dispatch history

All completed dispatches are persisted to `ems_history.db` (SQLite). You can query it directly:

```bash
sqlite3 ems_history.db "SELECT * FROM dispatch_logs ORDER BY dispatch_step DESC LIMIT 20;"
```

Or retrieve it through the REST endpoint:

```bash
curl http://localhost:8000/api/history
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Pipeline                                │
│  OpenStreetMap ──► OSMnx ──► netconvert ──► SUMO .net.xml           │
│  WorldPop  ──────────────────────────────► Hotspot weights          │
│  Incident generator ─────────────────────► incidents_*.json         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                     Simulation Layer (SUMO + TraCI)                 │
│  SimulationManager ──► step()  ──► TraCI bridge                     │
│  Hospital queuing  ──► estimate_wait_time() ──► time-to-care metric │
│  Background traffic ─────────────────────────► road congestion      │
└───────────┬──────────────────────────┬──────────────────────────────┘
            │                          │
┌───────────▼──────────┐  ┌────────────▼───────────────────────────┐
│   Dispatch DQN        │  │   MARL Traffic Controller              │
│   state:  47-dim      │  │   state:  3-dim per intersection       │
│   action: 12 (fleet)  │  │   action: 2 (keep / switch phase)      │
│   reward: shaped RT   │  │   reward: −queue − amb_stop + amb_go   │
└───────────┬──────────┘  └────────────┬───────────────────────────┘
            │                          │
┌───────────▼──────────────────────────▼──────────────────────────────┐
│                       Live Server (FastAPI)                         │
│  REST: /api/history        WebSocket: /ws/{role}/{client_id}        │
│  SQLite: ems_history.db    CORS-enabled for cross-origin clients    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                ┌───────────────▼────────────────┐
                │   React Dashboard               │
                │   kigali-ems-ui (port 3000)     │
                │   Real-time map, fleet status,  │
                │   hospital queue boards         │
                └────────────────────────────────┘
```

## Model Details

### DQN Dispatch Agent

The dispatch agent observes a **47-dimensional continuous state vector** at every incident arrival:

```
[amb_0_x/30000, amb_0_y/30000, amb_0_available,   ← 3 features per ambulance
 amb_1_x/30000, amb_1_y/30000, amb_1_available,
 ...                                               ← × 12 ambulances = 36 dims
 hosp_0_load_ratio, hosp_1_load_ratio, ...,        ← 8 hospital load ratios
 incident_x/30000, incident_y/30000, severity]     ← 3 incident features
```

All features are normalised to `[0, 1]`. Hospital load is expressed as `current_queue / capacity`, capped at 2× overload and rescaled.

The network architecture is a 4-layer MLP (47 → 128 → 128 → 64 → 12) with ReLU activations. The output is a Q-value for each of the 12 ambulances; unavailable units are masked to `−∞` before action selection.

**Reward function:**

```
r = (1 − T_care / T_max) × (0.5 + severity)
```

Where `T_care = drive_time + ED_wait_time`, `T_max = 1800 s` (30 minutes, the WHO urban EMS threshold), and `severity ∈ [0, 1]`. This produces positive rewards for fast responses and scales the gradient signal proportionally to incident severity, ensuring critical calls drive the strongest learning signal.

### MARL Traffic Controller

Each signalised intersection acts as an independent agent observing a **3-dimensional state**:

```
[current_phase / 10.0,       ← normalised phase index
 max_queue_length / 50.0,    ← normalised queue
 ambulance_approaching_flag] ← 0.0 or 1.0
```

The shared network (3 → 64 → 64 → 2) outputs Q-values for two actions: keep the current phase or switch to the next phase. All intersections share one network and one replay buffer, enabling cooperative learning without explicit communication.

**Reward function:**

```
r = −0.5 × total_queue − 100 × (ambulance_stopped) + 50 × (ambulance_moving)
```

The asymmetric penalty structure ensures ambulance clearance is always the dominant objective.

### Hospital Queuing Model

Hospital wait time is derived from a fluid-queue model:

```
if current_queue < capacity:
    wait_time = 0
else:
    backlog            = current_queue − capacity + 1
    clearance_rate     = (capacity × service_rate_per_hour) / 3600
    wait_time          = backlog / clearance_rate
```

Hospital parameters are derived from the MINISANTE Rwanda 2022/23 Annual Report and Uwimana et al. (2021):

| Hospital | Bays | Service Rate | Notes |
|----------|------|-------------|-------|
| CHUK | 24 | 1.6 p/hr/bay | Tertiary referral, 503 beds |
| King Faisal | 12 | 2.1 p/hr/bay | Private referral, 150 beds |
| Rwanda Military | 18 | 1.5 p/hr/bay | 300-bed military hospital |
| Kibagabaga | 8 | 1.2 p/hr/bay | District, 107 beds |
| Nyamata | 6 | 1.1 p/hr/bay | District, 60 beds |
| Kaciiru | 6 | 1.1 p/hr/bay | Health centre |
| Masaka | 8 | 1.2 p/hr/bay | District, 90 beds |
| Muhima | 6 | 1.1 p/hr/bay | District, 80 beds |

## Benchmark Results

Results from `05_evaluate_system.ipynb`, 1-hour simulation, 180 incidents (high-demand scenario):

| Policy | Mean RT (s) | P90 RT (s) | Fleet Util. | Incidents Reached |
|--------|:-----------:|:----------:|:-----------:|:-----------------:|
| Random-Idle | 895 | 1920 | 0.955 | 95 / 180 |
| Nearest-Idle | 826 | 1869 | 0.931 | 93 / 180 |
| Severity-Priority | 630 | 1350 | 0.931 | 98 / 180 |
| **DQN-MARL** | **748** | **1838** | **0.940** | **103 / 180** |

The DQN-MARL agent reaches the most incidents overall (103 vs. 98 for the best heuristic), demonstrating superior coverage under high demand. The Severity-Priority heuristic achieves a lower mean response time by focusing exclusively on reachable calls; the DQN trades some speed for breadth, which is typically the operationally preferred outcome.

## Configuration Reference

Core simulation and training constants are defined inline at the top of each notebook cell. The most commonly adjusted values are:

| Constant | Location | Default | Effect |
|----------|----------|---------|--------|
| `EPISODES` | `03_train_dispatch.ipynb` | 10,000 | Total DQN training episodes |
| `COORD_SCALE` | `03_train_dispatch.ipynb` | 30,000 | Coordinate normalisation divisor |
| `MAX_RESPONSE_TIME` | `03_train_dispatch.ipynb` | 1,800 s | Reward shaping threshold |
| `EPISODES` | `04_train_traffic.ipynb` | 50 | MARL training episodes |
| `DECISION_INTERVAL` | `04_train_traffic.ipynb` | 5 steps | Traffic light re-evaluation cadence |
| `num_incidents` | `01_data_extraction.ipynb` | 10,000 | Total incidents in the seeded pool |

The SUMO simulation step length is fixed at **1 second** (`step-length=1.0`). The evaluation window is **3,600 steps = 1 simulated hour**.

## Acknowledgements

The spatial incident distribution and severity weightings in `src/environment/incident_gen.py` are calibrated using parameters from studies conducted on road traffic injuries in Kigali and sub-Saharan urban emergency care contexts. Hospital configuration figures are derived from the **MINISANTE Rwanda Service Availability and Readiness Assessment (2022/23)** and operational data published by the **Rwanda Biomedical Centre**.

This project was developed under the supervision of faculty at the African Leadership University, School of Science and Technology.
