# Kigali EMS Pipeline Optimization

A simulation-based capstone project for optimizing Kigali emergency response operations using:
- **RL-based dispatching** (ambulance/fire unit assignment)
- **Traffic signal priority / “green wave” control** for emergency vehicles
- **Hospital destination scoring** using **ED overload** (travel time + expected wait)



## High-level system (tiers)
1. **Data & Environment (Tier 1):** Kigali road network, hotspots, incident generation
2. **Digital Twin (Tier 2):** SUMO simulation (traffic + signals + emergency vehicles)
3. **Intelligence (Tier 3/5):** RL agents (dispatch + multi-agent signal control)
4. **Medical Tier (Tier 4):** hospital overload model feeding a time-to-care score
5. **Evaluation & Dashboard:** metrics, benchmarks, Streamlit visualization


## Requirements
- Python **3.10+**
- **SUMO** (required for TraCI / simulation)
- macOS supported (target: MacBook M3 Air)


## Setup (minimal)
1) Clone the repo:
```bash
git clone https://github.com/Christianib003/kigali-ems-pipeline-optimization.git
cd kigali-ems-pipeline-optimization
````

2. Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment variables:

* Copy `.env.example` to `.env`
* Fill in `SUMO_HOME` and (optional) `PROJECT_ROOT`


## How to run

- Start with:

* `notebooks/00_setup_sanity.ipynb`

- And proceed to run other notebooks.

## Figma Design
1. **Live Operations Dashboard**
![Live Operations](design/1-live_ops.png)

2. **Incidents**
![Incidents](design/2-incidents.png)

3. **Fleet**
![Fleet](design/3-fleet.png)

4. **Hospitals**
![Hospitals](design/4-hospitals.png)

5. **Traffic**
![Traffic](design/5-traffic.png)

6. **Analytics**
![Analytics](design/6-analytics.png)

7. **Scenario Control**
![Scenario Control](design/7-scenario_control.png)


## Credits:
- [The epidemiology of road traffic injury hotspots in Kigali, Rwanda from police data, published in 2016.](https://www.researchgate.net/publication/305803686_The_epidemiology_of_road_traffic_injury_hotspots_in_Kigali_Rwanda_from_police_data)


