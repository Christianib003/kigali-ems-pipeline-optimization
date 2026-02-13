# Notebook Rules (Professional + Debuggable)

This project is **notebook-first** for transparency and debugging.
Notebooks are the workspace; reusable logic lives in `src/`.

---

## 1) Notebook structure standard
Every notebook must follow this order and include explanation cells **before** code:

1. Title + Objective
2. Assumptions & Scope
3. Environment & Imports
4. Configuration (paths, seeds, parameters)
5. Data Load / Build (cached where possible)
6. Core Run (experiment/simulation/training)
7. Visualizations
8. Results Summary
9. Notes + Next Steps

Use numbered headers (e.g., `## 1.0 ...`, `## 2.0 ...`) and keep sections consistent.

---

## 2) What stays in notebooks vs what moves to `src/`
### Keep in notebooks
- Orchestration: calling functions, running experiments, plotting results
- Explanations: what is happening and why
- Lightweight checks: sanity checks, quick exploration

### Move to `src/`
- Any logic reused more than once (data loaders, generators, metrics)
- Anything that is complex enough to deserve unit tests
- Anything that would clutter the notebook (long functions)

**Rule of reuse:** if logic appears **twice**, move it to `src/`.

---

## 3) Debugging & logs (readable)
- Notebooks: use `print()` for progress and clear explanations.
- Modules (`src/`): use the project logger (INFO for progress, DEBUG for deep traces).
- Prefer labelled outputs:
  - `print("zone_id:", zone_id)`
  - `print("num_incidents:", len(incidents))`

Avoid dumping huge arrays; show:
- small samples (`head()`)
- summary stats (min/mean/max)
- counts and distributions

---

## 4) Resumability & caching (no rerunning from scratch)
Long tasks must save progress under `runs/`:
- save configs (`config.yaml`)
- save progress (`progress.json`)
- save metrics (`metrics.csv`)
- save checkpoints (`checkpoints/`)

Notebook pattern:
- If an expensive output exists, **load it**.
- If not, build it once and **save it**.

---

## 5) MacBook M3 Air constraints
- Start with smaller network subsets and fewer controlled intersections.
- Use short training runs during development (minutes, not hours).
- Log progress frequently and checkpoint often.
- Prefer incremental benchmarks (resume from episode N+1).

---

## 6) Notebook outputs
- Figures for the report go in: `reports/figures/`
- Tables go in: `reports/tables/`
- Run artifacts go in: `runs/`
