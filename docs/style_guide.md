# Kigali EMS Pipeline - Python Style Guide

## Core Philosophy
- **Readability > Cleverness**: Avoid complex one-liners or heavy metaprogramming.
- **Explicit > Implicit**: Variable names should describe their purpose (e.g., `ambulance_eta` vs `a_eta`).
- **Modular**: Reusable logic belongs in `src/`, orchestration belongs in `notebooks/`.

## Standards
1. **Loops**: Prefer clear `for` loops and list comprehensions. Avoid deep nesting.
2. **Functions**: 
   - Keep functions focused on a single task.
   - Use short docstrings (2–6 lines) explaining inputs and outputs.
3. **Variables**: Use `snake_case` for variables/functions and `PascalCase` for classes.
4. **Intermediate Steps**: In complex calculations, break the logic into intermediate variables to make debugging in notebooks easier.
5. **Formatting**: Code must be compatible with `black` and `ruff` standards.

## Notebook Rules
- Every notebook must start with a "Setup" cell (imports and config).
- No hardcoded paths; use the centralized directory structure.