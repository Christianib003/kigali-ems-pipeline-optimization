# Architecture (Kigali EMS Pipeline Optimization)

## 1) Overview
This capstone builds a **simulation-based EMS optimization system** for Kigali. A SUMO “digital twin” is used to model traffic, emergency vehicles, incidents, and hospital overload. The system evaluates baseline policies versus RL-based policies for dispatching and traffic-signal priority.

## 2) Main components
### Notebooks (workflow)
- `notebooks/`: notebook-first workflow for exploration, debugging, and visualization.
- Notebooks orchestrate runs and call reusable modules from `src/`.

### Reusable modules (`src/`)
- `src/data/`: loading and preparing OSM network, zones, hotspots, incident datasets
- `src/sim/`: SUMO control loop (TraCI), entities (incidents, emergency vehicles), stepping logic
- `src/rl/`: RL environments and training loops (dispatch DQN, signal control MARL)
- `src/viz/`: reusable plotting helpers for metrics and map overlays
- `src/utils/`: logging, run manager (resume), checkpoint helpers, caching utilities

### Simulation assets
- `sim/`: SUMO network and configuration artifacts

### Outputs
- `runs/`: resumable artifacts per run (configs, logs, checkpoints, metrics)
- `reports/`: figures and tables used in the final report
- `dashboard/`: Streamlit UI to visualize live playback and benchmark results

## 3) System flow (end-to-end)
1) **Environment** loads Kigali network + traffic configuration (SUMO)
2) **Incident generator** creates an incident (location, time, severity)
3) **Dispatch policy** selects an emergency vehicle (baseline or RL)
4) **Routing + driving** moves EV through the network (ETA updates over time)
5) **Signal priority** applies green-wave behavior on the EV corridor (baseline or RL)
6) **Scene arrival** records response time and transitions incident state
7) **Hospital selection** scores hospitals using travel time + estimated ED wait (overload)
8) **Transport + handover** completes the case and updates hospital load
9) **Logging** writes metrics to `runs/<component>/<run_id>/...` for analysis and resuming

## 4) Notebook-first rule
- Prototype logic in notebooks with prints/plots.
- If logic is reused (appears twice), move it to `src/` as a small function with a short docstring.
- Notebooks remain clean: mostly config + calls into modules.

## 5) Resumability (important)
Long-running tasks (training, benchmarking, data generation) must:
- Write outputs incrementally to a run folder
- Save progress and checkpoints periodically
- Resume automatically from the latest checkpoint/progress file
