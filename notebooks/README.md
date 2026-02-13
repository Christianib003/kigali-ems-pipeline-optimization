# Notebooks Index (Notebook-First Workflow)

This project is developed **notebook-first** for clarity, debugging, and visual evidence.
Reusable logic is implemented in `src/` and imported into notebooks to keep notebooks clean.

---

## Naming convention
Notebooks are numbered to reflect the recommended execution order:

`NN_topic.ipynb` (e.g., `00_setup_sanity.ipynb`)

---

## Notebooks (planned order)

### `00_setup_sanity.ipynb`
**Purpose:** Verify local environment and core imports.  
**Outputs:** None (diagnostics only).

### `01_osm_to_sumo.ipynb`
**Purpose:** Download Kigali road network (OSM), clean it, and convert to SUMO network.  
**Outputs:** `sim/net/*.net.xml`, cached OSM extracts under `data/`.

### `02_incident_generator.ipynb`
**Purpose:** Build hotspot-informed incident generator and generate a reproducible incident dataset.  
**Outputs:** `data/processed/incidents_*.parquet`, summary plots.

### `03_background_traffic_calibration.ipynb`
**Purpose:** Create and calibrate background traffic flows.  
**Outputs:** SUMO route files, calibration plots in `reports/figures/`.

### `04_baselines_run.ipynb`
**Purpose:** Implement and validate baseline dispatch and signal priority policies.  
**Outputs:** baseline benchmark results in `runs/benchmarks/...`.

### `05_dqn_dispatch_training.ipynb`
**Purpose:** Train a DQN dispatch agent with checkpoints and resume support.  
**Outputs:** `runs/dispatch_dqn/...` (checkpoints, metrics).

### `06_marl_signals_training.ipynb`
**Purpose:** Train MARL signal priority agents (small corridor first) with resume support.  
**Outputs:** `runs/signals_marl/...` (checkpoints, metrics).

### `07_hospital_overload_model.ipynb`
**Purpose:** Build hospital overload model and destination scoring (travel + wait).  
**Outputs:** hospital logs and scoring diagnostics.

### `08_end_to_end_eval.ipynb`
**Purpose:** Full integration benchmark (baseline vs RL) with statistical comparisons.  
**Outputs:** final benchmark tables + figures.

### `09_dashboard_data_prep.ipynb`
**Purpose:** Prepare metrics/artifacts for the Streamlit dashboard.  
**Outputs:** exported summaries used by `dashboard/`.

---

## Resumability rules (important)
- Expensive steps should save outputs to `data/processed/` or `sim/` and reload them when available.
- Long-running tasks (training/benchmarks) write to `runs/` and can resume from the last checkpoint/progress file.
