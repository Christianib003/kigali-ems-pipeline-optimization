import React, { useState, useEffect, useRef } from 'react';
import { Activity, Truck, PlusSquare, Monitor } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState(null);
  const [clientId, setClientId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const ws = useRef(null);

  // --- WEBSOCKET CONNECTION MANAGER ---
  useEffect(() => {
    if (!role || !clientId) return;

    // Connect to your FastAPI Python Server
    const socketUrl = `ws://localhost:8000/ws/${role}/${clientId}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      console.log(`Connected as ${role.toUpperCase()} - ${clientId}`);
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveData(data);
    };

    ws.current.onclose = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [role, clientId]);

  // --- LOGIN HANDLER ---
  const handleLogin = (selectedRole, id) => {
    setRole(selectedRole);
    setClientId(id);
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    if (ws.current) ws.current.close();
    setRole(null);
    setClientId('');
    setLiveData(null);
  };

  // ==========================================
  // VIEW 1: LOGIN SCREEN
  // ==========================================
  if (!role) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#1e1e2f', color: 'white', minHeight: '100vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}><Activity size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }}/> Kigali EMS Live Command</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Controller Login */}
          <div style={cardStyle}>
            <h2><Monitor /> Controller</h2>
            <p>Global Command Center</p>
            <button onClick={() => handleLogin('controller', 'global')} style={btnStyle}>Access God Mode</button>
          </div>

          {/* Ambulance Login */}
          <div style={cardStyle}>
            <h2><Truck /> Ambulance MDT</h2>
            <p>Mobile Data Terminal</p>
            <select id="amb-select" style={inputStyle} defaultValue="AMB_0">
              {[...Array(12)].map((_, i) => <option key={i} value={`AMB_${i}`}>Ambulance {i}</option>)}
            </select>
            <button onClick={() => handleLogin('ambulance', document.getElementById('amb-select').value)} style={btnStyle}>Login to Rig</button>
          </div>

          {/* Hospital Login */}
          <div style={cardStyle}>
            <h2><PlusSquare /> Hospital Board</h2>
            <p>ER Receiving Terminal</p>
            <select id="hosp-select" style={inputStyle} defaultValue="CHUK">
              {['CHUK', 'KFH', 'RMH', 'KIB', 'NYA', 'KAC', 'MAS', 'MUH'].map(h => <option key={h} value={h}>{h} ER</option>)}
            </select>
            <button onClick={() => handleLogin('hospital', document.getElementById('hosp-select').value)} style={btnStyle}>View Incoming</button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE DASHBOARD (Temporary Placeholder)
  // ==========================================
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#00ff00', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
        <h2>{role.toUpperCase()} TERMINAL: {clientId}</h2>
        <div>
          <span style={{ marginRight: '20px', color: isConnected ? '#00ff00' : 'red' }}>
            {isConnected ? '● LIVE CONNECTION' : '○ DISCONNECTED'}
          </span>
          <button onClick={handleLogout} style={{...btnStyle, backgroundColor: '#e74c3c'}}>Logout</button>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Raw Telemetry Stream (Step: {liveData?.step || 0})</h3>
        <pre style={{ backgroundColor: '#1e1e1e', padding: '1rem', borderRadius: '8px', overflowX: 'auto', color: '#d4d4d4' }}>
          {JSON.stringify(liveData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// --- Basic Inline Styles for the Login Screen ---
const cardStyle = {
  backgroundColor: '#2c2c3e', padding: '2rem', borderRadius: '12px', width: '300px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
};
const btnStyle = {
  backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', width: '100%', marginTop: '1rem', fontWeight: 'bold'
};
const inputStyle = {
  width: '100%', padding: '10px', marginTop: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1e1e2f', color: 'white'
};