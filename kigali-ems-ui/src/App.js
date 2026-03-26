import React, { useState, useEffect, useRef } from 'react';
import { Activity, Truck, PlusSquare, Monitor, MapPin, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState(null);
  const [clientId, setClientId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    if (!role || !clientId) return;

    const socketUrl = `ws://localhost:8000/ws/${role}/${clientId}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onmessage = (event) => setLiveData(JSON.parse(event.data));
    ws.current.onclose = () => setIsConnected(false);

    return () => { if (ws.current) ws.current.close(); };
  }, [role, clientId]);

  const handleLogin = (selectedRole, id) => {
    setRole(selectedRole);
    setClientId(id);
  };

  const handleLogout = () => {
    if (ws.current) ws.current.close();
    setRole(null);
    setClientId('');
    setLiveData(null);
  };

  // Helper function to format seconds into MM:SS
  const formatETA = (seconds) => {
    if (seconds === undefined || seconds === null) return "--:--";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ==========================================
  // VIEW 1: LOGIN SCREEN
  // ==========================================
  if (!role) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#0f0f1a', color: 'white', minHeight: '100vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: '#00e5ff' }}>
          <Activity size={36} style={{ verticalAlign: 'middle', marginRight: '15px' }}/> 
          Kigali EMS Live Command
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <Monitor size={48} color="#00e5ff" />
            <h2 style={{marginTop: '1rem'}}>Controller</h2>
            <p style={{color: '#888'}}>Global Map & Metrics</p>
            <button onClick={() => handleLogin('controller', 'global')} style={btnStyle('#00e5ff')}>Access God Mode</button>
          </div>

          <div style={cardStyle}>
            <Truck size={48} color="#ff3366" />
            <h2 style={{marginTop: '1rem'}}>Ambulance MDT</h2>
            <p style={{color: '#888'}}>Mobile Data Terminal</p>
            <select id="amb-select" style={inputStyle} defaultValue="AMB_0">
              {[...Array(12)].map((_, i) => <option key={i} value={`AMB_${i}`}>Ambulance {i}</option>)}
            </select>
            <button onClick={() => handleLogin('ambulance', document.getElementById('amb-select').value)} style={btnStyle('#ff3366')}>Login to Rig</button>
          </div>

          <div style={cardStyle}>
            <PlusSquare size={48} color="#00e676" />
            <h2 style={{marginTop: '1rem'}}>Hospital Board</h2>
            <p style={{color: '#888'}}>ER Receiving Terminal</p>
            <select id="hosp-select" style={inputStyle} defaultValue="CHUK">
              {['CHUK', 'KFH', 'RMH', 'KIB', 'NYA', 'KAC', 'MAS', 'MUH'].map(h => <option key={h} value={h}>{h} ER</option>)}
            </select>
            <button onClick={() => handleLogin('hospital', document.getElementById('hosp-select').value)} style={btnStyle('#00e676')}>View Incoming</button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: CONTROLLER (GOD MODE MAP)
  // ==========================================
  if (role === 'controller') {
    return (
      <div style={dashboardLayout}>
        <Header role={role} clientId={clientId} isConnected={isConnected} onLogout={handleLogout} />
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', height: '80vh' }}>
          {/* THE LIVE MAP */}
          <div style={{ flex: 3, backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '1rem', position: 'relative', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#00e5ff' }}><MapPin style={{verticalAlign:'bottom'}}/> Kigali Live Sector Map</h3>
            
            {/* SVG Coordinate Mapper. SUMO X: 5k-25k, Y: 5k-15k */}
            <svg width="100%" height="90%" viewBox="0 0 20000 10000" style={{ backgroundColor: '#0f0f1a', borderRadius: '8px' }}>
              
              {/* Render Active Incidents */}
              {liveData?.incidents?.map(inc => (
                <g key={inc.id} transform={`translate(${inc.x - 5000}, ${15000 - inc.y})`}>
                  <circle r="150" fill={inc.status === 'PENDING' ? '#ff3366' : '#f39c12'} className="pulse-anim" />
                  <text y="-250" fill="white" fontSize="200" textAnchor="middle">{inc.id}</text>
                </g>
              ))}

              {/* Render Live Ambulances */}
              {liveData?.ambulances?.map(amb => (
                <g key={amb.id} transform={`translate(${amb.x - 5000}, ${15000 - amb.y})`}>
                  <circle r="200" fill={amb.status === 'IDLE' ? '#888' : amb.status === 'RESPONDING' ? '#00e5ff' : amb.status === 'TRANSPORTING' ? '#00e676' : '#f39c12'} />
                  <text y="-300" fill="white" fontSize="250" textAnchor="middle" fontWeight="bold">{amb.id}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* METRICS SIDEBAR */}
          <div style={{ flex: 1, backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', border: '1px solid #333', overflowY: 'auto' }}>
            <h3 style={{ color: '#00e5ff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>System Metrics</h3>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#888', margin: '5px 0' }}>Simulation Step</p>
              <h2 style={{ margin: 0 }}>{liveData?.step || 0} / 3600</h2>
            </div>
            
            <h3 style={{ color: '#00e5ff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Active Fleet</h3>
            {liveData?.ambulances?.map(amb => (
              <div key={amb.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                <span style={{ fontWeight: 'bold' }}>{amb.id}</span>
                <span style={{ color: amb.status === 'IDLE' ? '#888' : '#00e5ff' }}>{amb.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: AMBULANCE MDT (MOBILE TERMINAL)
  // ==========================================
  if (role === 'ambulance') {
    const isBusy = liveData?.status !== 'IDLE';
    return (
      <div style={dashboardLayout}>
        <Header role={role} clientId={clientId} isConnected={isConnected} onLogout={handleLogout} />
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '3rem', width: '600px', border: `2px solid ${isBusy ? '#ff3366' : '#333'}`, textAlign: 'center' }}>
            
            <h2 style={{ color: isBusy ? '#ff3366' : '#888', fontSize: '2rem', margin: '0 0 2rem 0' }}>
              STATUS: {liveData?.status || 'AWAITING DISPATCH'}
            </h2>

            {isBusy ? (
              <>
                <div style={{ backgroundColor: '#0f0f1a', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <p style={{ color: '#888', fontSize: '1.2rem', margin: 0 }}>LIVE ETA</p>
                  <h1 style={{ fontSize: '5rem', margin: '10px 0', color: '#00e5ff', fontFamily: 'monospace' }}>
                    {formatETA(liveData?.live_eta_seconds)}
                  </h1>
                </div>

                <div style={{ textAlign: 'left', backgroundColor: '#222233', padding: '1.5rem', borderRadius: '8px' }}>
                  <h3 style={{ color: '#f39c12', margin: '0 0 10px 0' }}><ShieldAlert /> Incident Details</h3>
                  <p><strong>ID:</strong> {liveData?.incident_details?.id}</p>
                  <p><strong>Severity:</strong> Level {liveData?.incident_details?.severity}</p>
                  <p><strong>Target Hospital:</strong> {liveData?.hospital_destination}</p>
                </div>
              </>
            ) : (
              <div style={{ padding: '3rem', color: '#555' }}>
                <Activity size={64} style={{ marginBottom: '1rem' }}/>
                <p>Standing by for AI Dispatch...</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: HOSPITAL RECEIVING BOARD
  // ==========================================
  if (role === 'hospital') {
    return (
      <div style={dashboardLayout}>
        <Header role={role} clientId={clientId} isConnected={isConnected} onLogout={handleLogout} />
        
        <div style={{ marginTop: '2rem', backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '2rem', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: '#00e676' }}><AlertTriangle style={{verticalAlign:'bottom'}}/> Inbound Trauma Board</h2>
            <div style={{ backgroundColor: '#0f0f1a', padding: '10px 20px', borderRadius: '8px' }}>
              <span style={{ color: '#888', marginRight: '10px' }}>Current ER Queue:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{liveData?.current_queue || 0} Patients</span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f0f1a', color: '#888' }}>
                <th style={thStyle}>Transport Unit</th>
                <th style={thStyle}>Patient Severity</th>
                <th style={thStyle}>Live ETA</th>
              </tr>
            </thead>
            <tbody>
              {liveData?.incoming_ambulances?.length > 0 ? (
                liveData.incoming_ambulances.map((amb, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                    <td style={tdStyle}><strong>{amb.ambulance_id}</strong></td>
                    <td style={tdStyle}><span style={badgeStyle(amb.patient_severity)}>Level {amb.patient_severity}</span></td>
                    <td style={{...tdStyle, color: '#00e5ff', fontWeight: 'bold', fontSize: '1.2rem'}}><Clock size={18} style={{verticalAlign:'sub', marginRight:'5px'}}/> {formatETA(amb.live_eta_seconds)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No inbound ambulances at this time.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

// --- SHARED HEADER COMPONENT ---
const Header = ({ role, clientId, isConnected, onLogout }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
    <h2 style={{ margin: 0, color: 'white' }}>
      {role === 'controller' ? <Monitor color="#00e5ff" style={{verticalAlign:'bottom', marginRight:'10px'}}/> : role === 'ambulance' ? <Truck color="#ff3366" style={{verticalAlign:'bottom', marginRight:'10px'}}/> : <PlusSquare color="#00e676" style={{verticalAlign:'bottom', marginRight:'10px'}}/>}
      {role.toUpperCase()} TERMINAL <span style={{color: '#888'}}>// {clientId}</span>
    </h2>
    <div>
      <span style={{ marginRight: '20px', color: isConnected ? '#00e676' : '#ff3366', fontWeight: 'bold' }}>
        {isConnected ? '● CONNECTED' : '○ DISCONNECTED'}
      </span>
      <button onClick={onLogout} style={{ backgroundColor: '#2c2c3e', color: 'white', border: '1px solid #444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Disconnect</button>
    </div>
  </div>
);

// --- STYLES ---
const dashboardLayout = { padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#0f0f1a', color: 'white', minHeight: '100vh' };
const cardStyle = { backgroundColor: '#1a1a2e', padding: '3rem 2rem', borderRadius: '12px', width: '280px', textAlign: 'center', border: '1px solid #333' };
const btnStyle = (color) => ({ backgroundColor: color, color: '#0f0f1a', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', width: '100%', marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1rem' });
const inputStyle = { width: '100%', padding: '12px', marginTop: '15px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#0f0f1a', color: 'white', fontSize: '1rem' };
const thStyle = { padding: '1rem', borderBottom: '2px solid #333' };
const tdStyle = { padding: '1rem' };
const badgeStyle = (sev) => ({ backgroundColor: sev >= 4 ? '#ff3366' : sev === 3 ? '#f39c12' : '#3498db', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' });