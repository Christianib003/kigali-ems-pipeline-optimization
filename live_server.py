import asyncio
import json
import logging
import math
import sys
from pathlib import Path
import numpy as np
import traci
import sumolib

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- Import your Capstone Engine ---
sys.path.append(str(Path.cwd()))
from src.environment.manager import SimulationManager
from src.environment.hospital import Hospital
from src.agents.dispatch_dqn import DispatchAgent

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- Paths ---
net_path = Path("data/processed/kigali_connected.net.xml")
route_path = Path("data/processed/kigali_connected_traffic.rou.xml")
incidents_path = Path("data/processed/incidents_high_stress.json")
dqn_model_path = Path("models/dqn_dispatch_v1.pt")

net = sumolib.net.readNet(str(net_path))

def get_nearest_edge(x, y):
    edges = net.getNeighboringEdges(x, y, 2000) 
    valid_edges = [e[0] for e in edges if e[0].getID() != "1188083591" and e[0].allows("passenger")]
    if valid_edges:
        valid_edges.sort(key=lambda e: e.getLength(), reverse=True)
        return valid_edges[0].getID()
    return [e for e in net.getEdges() if e.allows("passenger")][0].getID()

# --- Connection Manager ---
class EMSConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, role: str, client_id: str):
        await websocket.accept()
        self.active_connections[(role, client_id)] = websocket
        logging.info(f"🖥️ {role.upper()} Terminal Connected: {client_id}")

    def disconnect(self, role: str, client_id: str):
        if (role, client_id) in self.active_connections:
            del self.active_connections[(role, client_id)]
            logging.info(f"❌ {role.upper()} Terminal Disconnected: {client_id}")

    async def send_personal_message(self, message: dict, role: str, client_id: str):
        websocket = self.active_connections.get((role, client_id))
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception:
                pass

    async def broadcast_to_controllers(self, message: dict):
        for (role, client_id), websocket in self.active_connections.items():
            if role == "controller":
                try:
                    await websocket.send_json(message)
                except Exception:
                    pass

manager = EMSConnectionManager()

@app.websocket("/ws/{role}/{client_id}")
async def ems_live_endpoint(websocket: WebSocket, role: str, client_id: str):
    await manager.connect(websocket, role, client_id)
    try:
        while True:
            data = await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect(role, client_id)


# --- LIVE SUMO ENGINE ---
# --- LIVE SUMO ENGINE ---
async def run_sumo_simulation():
    logging.info("🚀 Booting Live SUMO AI Engine Background Task...")
    
    dqn = DispatchAgent(state_dim=47, action_dim=12)
    dqn.load_model(dqn_model_path)
    
    while True:
        logging.info("☀️ Starting a new 1-hour shift in Kigali...")
        sim_manager = SimulationManager(net_path, route_path, use_gui=False)
        
        with open(incidents_path, 'r') as f:
            incidents = json.load(f)
            
        hospitals = [
            Hospital("CHUK", "CHUK", get_nearest_edge(8777.2, 13225.8), 20, 1.5),
            Hospital("KFH", "KFH", get_nearest_edge(12618.8, 13298.9), 10, 2.0),
            Hospital("RMH", "RMH", get_nearest_edge(16910.0, 10915.7), 15, 1.5),
            Hospital("KIB", "KIB", get_nearest_edge(15566.8, 15008.3), 8, 1.2),
            Hospital("NYA", "NYA", get_nearest_edge(6892.3, 8574.0), 8, 1.2),
            Hospital("KAC", "KAC", get_nearest_edge(11003.5, 13672.4), 8, 1.2),
            Hospital("MAS", "MAS", get_nearest_edge(24042.0, 7497.3), 8, 1.2),
            Hospital("MUH", "MUH", get_nearest_edge(8554.1, 13446.8), 6, 1.2)
        ]
        
        fleet = []
        for idx, h in enumerate(hospitals):
            count = 3 if h.id == "CHUK" else 2 if h.id in ["RMH", "KFH"] else 1
            hx, hy = net.getEdge(h.edge_id).getShape()[0]
            for _ in range(count):
                fleet.append({
                    "id": f"AMB_{len(fleet)}", "base_hospital": idx, 
                    "available": 1.0, 
                    "x": hx, "y": hy, # Current Live GPS
                    "base_x": hx, "base_y": hy, # Home Hospital GPS
                    "start_x": hx, "start_y": hy, # Where did the current trip start?
                    "target_x": hx, "target_y": hy, # Where is it driving to?
                    "dispatch_step": 0,
                    "status": "IDLE", "assigned_incident": None,
                    "arrival_step": 0, "resolved_step": 0, "inc_data": None
                })
        
        current_incident_idx = 0
        pending_queue = []
        active_incidents = {}
        
        sim_manager.start()
        step = 0
        
        try:
            while step < 3600:
                sim_manager.step()
                
                # ==========================================================
                # 1. LIVE GPS MOVEMENT ENGINE
                # ==========================================================
                for amb in fleet:
                    if amb["available"] == 0.0:
                        if step < amb["arrival_step"]:
                            amb["status"] = "RESPONDING"
                            # Calculate exactly how far along the route it is (0.0 to 1.0)
                            progress = (step - amb["dispatch_step"]) / max(1, (amb["arrival_step"] - amb["dispatch_step"]))
                            amb["x"] = amb["start_x"] + (amb["target_x"] - amb["start_x"]) * progress
                            amb["y"] = amb["start_y"] + (amb["target_y"] - amb["start_y"]) * progress
                            
                        elif step < amb["arrival_step"] + 60:
                            amb["status"] = "ON_SITE"
                            amb["x"] = amb["target_x"]
                            amb["y"] = amb["target_y"]
                            
                        elif step < amb["resolved_step"]:
                            amb["status"] = "TRANSPORTING"
                            # Driving back to the hospital
                            departure_step = amb["arrival_step"] + 60
                            progress = (step - departure_step) / max(1, (amb["resolved_step"] - departure_step))
                            amb["x"] = amb["target_x"] + (amb["base_x"] - amb["target_x"]) * progress
                            amb["y"] = amb["target_y"] + (amb["base_y"] - amb["target_y"]) * progress
                            
                        else:
                            amb["status"] = "IDLE"
                            amb["available"] = 1.0
                            amb["x"] = amb["base_x"]
                            amb["y"] = amb["base_y"]
                            if amb["inc_data"] and amb["inc_data"]["id"] in active_incidents:
                                del active_incidents[amb["inc_data"]["id"]]
                            amb["assigned_incident"] = None
                            amb["inc_data"] = None

                # 2. Process New Incidents
                while current_incident_idx < len(incidents) and step >= incidents[current_incident_idx]['time']:
                    inc = incidents[current_incident_idx]
                    inc['id'] = f"KGL_RTI_{current_incident_idx:04d}"
                    inc['spawn_step'] = step
                    inc['status'] = "PENDING"
                    pending_queue.append(inc)
                    active_incidents[inc['id']] = inc
                    current_incident_idx += 1
                    
                # 3. DQN AI Dispatch Engine
                while pending_queue and any(a["available"] == 1.0 for a in fleet):
                    pending_queue.sort(key=lambda x: x['spawn_step'])
                    inc = pending_queue.pop(0)
                    inc_edge = get_nearest_edge(inc['x'], inc['y'])
                    
                    state = []
                    for amb in fleet: state.extend([amb["x"], amb["y"], amb["available"]])
                    for h in hospitals: state.append(h.current_queue)
                    state.extend([inc["x"], inc["y"], inc.get("severity", 1.0)])
                    
                    mask = [a["available"] == 1.0 for a in fleet]
                    selected_amb_idx = dqn.select_action(np.array(state, dtype=np.float32), epsilon=0.0, available_mask=mask)
                    
                    if selected_amb_idx != -1 and inc_edge:
                        amb = fleet[selected_amb_idx]
                        hosp = hospitals[amb["base_hospital"]]
                        inc['status'] = "CLAIMED"
                        
                        if hosp.edge_id and inc_edge:
                            try:
                                route = traci.simulation.findRoute(hosp.edge_id, inc_edge)
                                drive_time = route.travelTime if route.edges else math.sqrt((amb['x'] - inc['x'])**2 + (amb['y'] - inc['y'])**2) / 15.0
                            except:
                                drive_time = math.sqrt((amb['x'] - inc['x'])**2 + (amb['y'] - inc['y'])**2) / 15.0
                                
                            drive_time *= 0.80 # AI Traffic assumption
                            
                            hosp.admit_patient()
                            wait_time = hosp.estimate_wait_time()
                            
                            amb["available"] = 0.0
                            amb["status"] = "RESPONDING"
                            amb["assigned_incident"] = inc["id"]
                            amb["inc_data"] = inc
                            
                            # Log the GPS targets for the movement engine
                            amb["dispatch_step"] = step
                            amb["start_x"] = amb["x"]
                            amb["start_y"] = amb["y"]
                            amb["target_x"] = inc["x"]
                            amb["target_y"] = inc["y"]
                            
                            amb["arrival_step"] = step + int(drive_time)
                            amb["resolved_step"] = amb["arrival_step"] + 60 + int(drive_time) + int(wait_time)

                # ===================================================================
                # 4. BROADCAST TO CONTROLLER (God Mode)
                # ===================================================================
                controller_payload = {
                    "type": "GLOBAL_STATE",
                    "step": step,
                    "ambulances": [{"id": a["id"], "status": a["status"], "x": a["x"], "y": a["y"], "assigned": a["assigned_incident"]} for a in fleet],
                    "incidents": list(active_incidents.values())
                }
                await manager.broadcast_to_controllers(controller_payload)

                # ===================================================================
                # 5. BROADCAST TO AMBULANCES (Mobile Terminals)
                # ===================================================================
                for amb in fleet:
                    if amb["status"] != "IDLE":
                        eta = max(0, amb["arrival_step"] - step) if amb["status"] == "RESPONDING" else max(0, amb["resolved_step"] - step)
                        amb_payload = {
                            "type": "AMBULANCE_TERMINAL",
                            "step": step,
                            "status": amb["status"],
                            "incident_details": amb["inc_data"],
                            "hospital_destination": hospitals[amb["base_hospital"]].id,
                            "live_eta_seconds": eta
                        }
                        await manager.send_personal_message(amb_payload, "ambulance", amb["id"])

                # ===================================================================
                # 6. BROADCAST TO HOSPITALS (Receiving Boards)
                # ===================================================================
                for idx, hosp in enumerate(hospitals):
                    incoming = []
                    for amb in fleet:
                        if amb["base_hospital"] == idx and amb["status"] in ["RESPONDING", "ON_SITE", "TRANSPORTING"]:
                            incoming.append({
                                "ambulance_id": amb["id"],
                                "patient_severity": amb["inc_data"].get("severity", 1) if amb["inc_data"] else 1,
                                "live_eta_seconds": max(0, amb["resolved_step"] - step)
                            })
                    
                    hosp_payload = {
                        "type": "HOSPITAL_BOARD",
                        "step": step,
                        "hospital_id": hosp.id,
                        "current_queue": hosp.current_queue,
                        "incoming_ambulances": incoming
                    }
                    await manager.send_personal_message(hosp_payload, "hospital", hosp.id)

                step += 1
                await asyncio.sleep(0.1) 
                
        finally:
            sim_manager.close()
            logging.info("🌙 Shift ended. Resetting simulation for the next loop...")
            await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_sumo_simulation())

if __name__ == "__main__":
    uvicorn.run("live_server:app", host="0.0.0.0", port=8000, reload=True)