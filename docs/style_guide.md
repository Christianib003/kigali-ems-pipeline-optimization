# Style Guide (Readable Python + Notebook-First)

This project prioritizes **clarity**, **debuggability**, and **reusability** over cleverness.
The primary development workflow is **notebook-first**, supported by clean Python modules in `src/`.

---

## 1) Core principles
- Prefer **readable code** over compact code.
- Write code that is easy to debug with prints/logs.
- Keep notebooks clean: notebooks **orchestrate**, modules **implement**.
- Build in small steps and keep each step testable.

---

## 2) Python coding rules (keep it simple)
- Prefer explicit `for` loops over complex one-liners when it improves understanding.
- Avoid overly advanced patterns (metaclasses, heavy decorators, deep inheritance).
- Keep functions small and focused (one job).
- Use clear variable names (e.g., `incident_time`, `zone_id`, `travel_time_sec`).
- Add intermediate variables instead of chaining long expressions.

---

## 3) Docstrings (short and useful)
All reusable functions in `src/` must have a short docstring:
- Aim for **2–6 lines**
- Explain what the function does
- Mention key inputs and outputs briefly

**Example:**
```python
def compute_ttc(travel_time_sec: float, wait_time_sec: float) -> float:
    """Compute total time-to-care (TTC).

    Args: travel_time_sec and wait_time_sec in seconds.
    Returns: TTC in seconds.
    """
    return travel_time_sec + wait_time_sec
````

---

## 4) Logging & debugging rules

* Use `print()` in notebooks for quick exploration and explanation.
* Use `logger.info()` / `logger.debug()` inside modules for repeatable logs.
* Log key events and metrics (episode start/end, dispatch decision, route ETA).
* When debugging, prefer structured output:

  * small tables (pandas DataFrame head)
  * labelled summaries (`name=value`)
  * avoid dumping massive arrays unless necessary

---

## 5) Notebook rules (clean + professional)

* Each notebook must have clear headers and explanation cells.
* Standard notebook flow:

  1. Purpose & assumptions
  2. Config & seeds
  3. Load/build data (cached if possible)
  4. Run experiment / simulation / training
  5. Visualize results
  6. Notes + next steps

**Rule of reuse:**

* If a block of logic appears **twice**, move it to `src/` as a function.

---

## 6) Minimal example: readable logging

```python
from src.utils.logging_utils import get_logger

logger = get_logger("incident_gen")

def sample_incident(zone_id: str, severity: int) -> dict:
    """Create a simple incident record for simulation.

    Args: zone_id (str), severity (int).
    Returns: dict with incident fields.
    """
    logger.info("Creating incident zone=%s severity=%s", zone_id, severity)
    return {"zone_id": zone_id, "severity": severity}
```