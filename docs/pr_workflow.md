# PR Workflow (Kigali EMS Capstone)

This project uses a simple branch + PR workflow to keep progress stable and reviewable.

---

## Branch roles
- **master**: stable branch (demoable/runnable checkpoints)
- **dev**: integration branch (latest completed task work)
- **feat/***: feature/task branches (work happens here)
  - Example: `feat/m1-dependencies`

---

## When to open PRs
Open a PR **at the end of every task** (M1.1, M1.2, ...):
- **From:** `feat/<task>`  
- **To:** `dev`

This keeps `dev` current and avoids large, risky merges.

---

## When to merge to master
Merge **dev → master** only when the project is stable:
- End of a milestone (e.g., M1 complete), **or**
- A demo-ready slice is complete (e.g., SUMO baseline runs working)

---

## Minimum checks before merging to master
- [ ] Repo installs without errors (venv + requirements)
- [ ] Imports sanity check passes
- [ ] No run artifacts are committed (e.g., `runs/` remains ignored)
- [ ] README setup steps still correct

---

## PR title & checklist
**Title format:**
- `M1.2: Python dependencies and workflow docs`

**Checklist (put in PR description):**
- [ ] Summary included
- [ ] How to verify included
- [ ] No large generated artifacts committed
