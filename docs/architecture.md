# Architecture Overview
- **Tier 1 (Data)**: OSMnx road network + Patel et al. (2016) hotspots.
- **Tier 2 (Sim)**: SUMO engine managed via TraCI.
- **Tier 3 (AI)**: DQN Dispatch + MARL Traffic Signals.
- **Tier 4 (Med)**: Hospital M/M/c queuing model.
- **Tier 5 (Eval)**: Time-to-Care (TTC) metrics.