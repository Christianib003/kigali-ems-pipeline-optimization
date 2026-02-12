# Experiments (How to Run + Resume)

This project uses a resumable run structure so long tasks (training, benchmarking) can continue after interruptions.

---

## 1) Run directory structure
All long-running processes write outputs to:

`runs/<component>/<run_id>/`

Examples:
- `runs/dispatch_dqn/20260212_1405_baseline/`
- `runs/signals_marl/20260212_2210_corridorA/`
- `runs/benchmarks/20260213_0900_eval_suite/`

A run folder typically contains:
- `config.yaml` — snapshot of settings used for the run
- `progress.json` — last completed step/episode index
- `logs.txt` — readable logs (INFO/DEBUG)
- `metrics.csv` — training or benchmark metrics over time
- `checkpoints/` — model checkpoints (weights + optimizer state)
- `artifacts/` — plots, summaries, and exported figures
- `episodes/` — (optional) per-episode logs for benchmark runs

---

## 2) Run naming conventions
- `run_id` should encode:
  - timestamp
  - scenario tag
  - policy tag

Recommended format:
- `<YYYYMMDD_HHMM>_<scenario>_<policy>`

Example:
- `20260212_1405_highTraffic_dqn`

---

## 3) Resuming rules
A run is resumable if it saves:
- latest checkpoint (for training)
- last completed episode index (for benchmarking)
- minimal progress metadata (`progress.json`)

Resume procedure:
1) Load `config.yaml` and `progress.json`
2) Find latest checkpoint in `checkpoints/`
3) Continue from `last_step/last_episode + 1`

---

## 4) Defining an experiment
Each experiment should specify:
- traffic level: low / medium / high
- incident rate: low / medium / high
- policy: baseline vs RL variant
- seed list: fixed seeds for repeatability
- number of episodes: e.g., 30–50

Experiments should be tracked in the GitHub Projects board and summarized in the final report.
