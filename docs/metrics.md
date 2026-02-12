# Metrics (Definitions)

This project compares baseline vs optimized (RL) policies using **EMS performance**, **traffic impact**, and **hospital overload** metrics.

---

## 1) EMS timing metrics
### Response time (seconds)
Time from incident creation to the first emergency vehicle arriving on scene.
- `response_time = t_arrive_scene - t_incident_created`

### On-scene time (seconds)
Time spent at the incident location before transport begins (can be fixed or sampled).
- `on_scene_time = t_depart_scene - t_arrive_scene`

### Transport time (seconds)
Time from leaving the scene to arriving at the selected hospital.
- `transport_time = t_arrive_hospital - t_depart_scene`

### Time-to-care proxy (TTC, seconds)
A decision metric used for hospital selection:
- `TTC = travel_time_to_hospital + expected_ed_wait_time`

> Note: TTC is a proxy for “time until care begins”, not a clinical outcome.

---

## 2) Distribution metrics
We report mean/median and **p90** (90th percentile), because emergency services care about tail risk:
- `p90_response_time`: the time under which 90% of responses fall

---

## 3) Traffic impact metrics (background traffic)
These quantify how emergency prioritization affects normal traffic.
Common metrics (collected per episode or per time window):
- **Average delay (seconds/vehicle):** difference between actual travel time and free-flow travel time
- **Average queue length (vehicles):** per controlled intersection approach (proxy)
- **Mean speed (m/s):** network-level average for non-emergency vehicles

We report “delta vs baseline” where possible:
- `traffic_delay_delta = delay_optimized - delay_baseline`

---

## 4) Hospital overload metrics (ED crowding only)
The hospital module models overload/crowding (not technical capability).
Metrics include:
- **Expected ED wait time (seconds):** returned by the queue/overload model
- **Overload frequency (%):** fraction of time hospital is above a crowding threshold
- **Average wait (seconds):** mean expected wait across arrivals

---

## 5) Aggregation rules
For each scenario (traffic level, incident rate, policy):
- Run multiple episodes (e.g., 30–50)
- Report:
  - mean/median/p90 response time across episodes
  - mean traffic delay delta across episodes
  - average and p90 TTC across transports
