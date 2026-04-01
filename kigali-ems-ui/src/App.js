import React, { useState, useEffect, useRef } from 'react';
import { Activity, Truck, BarChart2, Settings, ShieldAlert, MapPin, PlusSquare } from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  
  // WebSocket/Live Data States
  const [liveData, setLiveData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  // --- WEBSOCKET CONNECTION (Kept intact for when backend runs) ---
  useEffect(() => {
    if (!eulaAccepted) return;
    
    // Defaulting to controller role for the global dashboard
    const socketUrl = `ws://localhost:8000/ws/controller/admin_ui`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onmessage = (event) => setLiveData(JSON.parse(event.data));
    ws.current.onclose = () => setIsConnected(false);

    return () => { if (ws.current) ws.current.close(); };
  }, [eulaAccepted]);

  // ==========================================
  // VIEW 0: EULA & PRIVACY POLICY
  // ==========================================
  if (!eulaAccepted) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#f4f5f7', color: '#333', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '3rem', borderRadius: '8px', width: '100%', maxWidth: '800px', border: '1px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: '#111', textAlign: 'center', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '1.5rem' }}>EULA and Privacy Policy</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <strong>System:</strong> Kigali EMS Dispatch Optimisation Platform <br/>
            <strong>Version:</strong> 1.0 &nbsp;|&nbsp; <strong>Effective Date:</strong> March 2026 <br/>
            <strong>Developer:</strong> Christian Iradukunda Byiringiro, ALU
          </p>

          <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '4px', height: '350px', overflowY: 'auto', border: '1px solid #e0e0e0', color: '#444', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#111', marginTop: 0 }}>1. Acceptance</h3>
            <p>By clicking 'I Acknowledge and Accept' and proceeding to use this system, you agree to be bound by the terms of this EULA and Privacy Policy. You may not use this system if you do not accept these terms. This acknowledgement is mandatory and cannot be bypassed.</p>
            
            <h3 style={{ color: '#111' }}>2. Purpose of the System</h3>
            <p>This platform is a research prototype designed to simulate and optimise emergency medical service (EMS) dispatch decisions within a digital twin of Kigali's urban road network. It is intended for research, academic evaluation, and policy analysis purposes only.</p>

            <h3 style={{ color: '#111' }}>3. Prohibited Uses</h3>
            <p>You are expressly prohibited from using this system for any of the following purposes:</p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}>(a) Making final clinical or medical triage decisions without trained human oversight. This system must not replace qualified medical dispatch or clinical personnel.</li>
              <li style={{ marginBottom: '10px' }}>(b) Surveillance, monitoring, or tracking of individuals' urban movement patterns, regardless of stated purpose.</li>
              <li style={{ marginBottom: '10px' }}>(c) Any operational deployment affecting real patients, paramedics, or healthcare facilities without first obtaining appropriate institutional approvals, a fresh Data Protection Impact Assessment (DPIA), and re-approval from an Ethics in Research Committee.</li>
            </ul>

            <h3 style={{ color: '#111' }}>4. Data Processed by This System</h3>
            <p>In its current prototype form, this system processes only synthetic simulation data: algorithmically generated incident locations, severity classifications, and ambulance movement data. No real patient data, personal health information, or personally identifiable information (PII) is collected, stored, or transmitted at any stage. If this system is adapted for operational use, a formal DPIA must be conducted under the Rwanda Law No. 058/2021 on the Protection of Personal Data and Privacy before any real data is processed.</p>

            <h3 style={{ color: '#111' }}>5. Data Minimisation</h3>
            <p>The system is architected on the principle of data minimisation: dispatch decisions require only incident location (GPS coordinates) and severity classification. No patient name, age, identity, or medical history is required or should be provided to the system at any stage, including in operational deployments.</p>

            <h3 style={{ color: '#111' }}>6. Human Oversight Requirement</h3>
            <p>This system is a decision-support tool. All dispatch recommendations generated by the AI agent must be reviewed and confirmed by a trained human dispatcher before being acted upon in any real-world operational context. The system does not and must not operate as a fully autonomous dispatcher in life-critical settings. This requirement is consistent with the IEEE Ethically Aligned Design principles and Article 22 of the GDPR.</p>

            <h3 style={{ color: '#111' }}>7. Transparency and Accountability</h3>
            <p>All users of this system are entitled to an explanation of how dispatch decisions are made. The system logs all dispatch decisions, associated policy, and outcomes for audit and review. Users may request access to these logs at any time. The developer is accountable for the design of the algorithm and is obligated to disclose known limitations, including the current DQN model's performance characteristics, to any organisation considering operational deployment.</p>

            <h3 style={{ color: '#111' }}>8. Limitation of Liability</h3>
            <p>This system is provided for research purposes only. The developer makes no warranty — express or implied — regarding the accuracy, fitness for purpose, or completeness of the system's dispatch recommendations. The developer accepts no liability for outcomes resulting from misuse, unauthorised operational deployment, or use in contravention of the prohibited uses listed in Clause 3.</p>

            <h3 style={{ color: '#111' }}>9. Contact and Reporting</h3>
            <p>Any concerns about data use, system misuse, or ethical violations should be reported to: <strong>christian.iradukunda@alustudent.com</strong>. For REC-related concerns: Ethics in Research Committee, African Leadership University, Kigali, Rwanda.</p>
          </div>

          <button 
            onClick={() => setEulaAccepted(true)} 
            style={{ backgroundColor: '#ffdd00', color: '#111', border: '1px solid #e0c200', padding: '16px 24px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            I Acknowledge and Accept
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN APP LAYOUT
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f5f7', fontFamily: 'sans-serif', color: '#111' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Kigali EMS</h2>
        </div>
        
        <nav style={{ flex: 1, padding: '10px 0' }}>
          <NavItem icon={<MapPin size={18}/>} label="Live Operations" isActive={activeTab === 'live'} onClick={() => setActiveTab('live')} />
          <NavItem icon={<Activity size={18}/>} label="Incidents" isActive={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')} />
          <NavItem icon={<Truck size={18}/>} label="Fleet" isActive={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} />
          <NavItem icon={<PlusSquare size={18}/>} label="Hospitals" isActive={activeTab === 'hospitals'} onClick={() => setActiveTab('hospitals')} />
          <NavItem icon={<ShieldAlert size={18}/>} label="Traffic / Green Wave" isActive={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} />
          <NavItem icon={<BarChart2 size={18}/>} label="Analytics" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavItem icon={<Settings size={18}/>} label="Scenario Control" isActive={activeTab === 'scenario'} onClick={() => setActiveTab('scenario')} />
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Services Dispatch & Traffic UI</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #e0e0e0', padding: '6px 12px', borderRadius: '4px', backgroundColor: '#f9fafb' }}>Kigali • Demo</span>
          </div>
        </header>

        {/* SCROLLABLE VIEW CONTAINER */}
        {/* SCROLLABLE VIEW CONTAINER */}
        <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'live' && <LiveOperationsView liveData={liveData} />}
          {activeTab === 'incidents' && <IncidentsView liveData={liveData} />}
          {activeTab === 'fleet' && <FleetView liveData={liveData} />}
          {activeTab === 'hospitals' && <HospitalsView liveData={liveData} />}
          {activeTab === 'analytics' && <AnalyticsView />}
          
          {/* Fallback for components not yet built */}
          {activeTab === 'traffic' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              <h2>TRAFFIC / GREEN WAVE VIEW</h2>
              <p>Component under construction. Planned for Phase 2 deployment.</p>
            </div>
          )}
          {activeTab === 'scenario' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              <h2>SCENARIO CONTROL VIEW</h2>
              <p>Component under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 1: LIVE OPERATIONS DASHBOARD (WIRED & INTERACTIVE)
// ==========================================
const LiveOperationsView = ({ liveData }) => {
  // --- LOCAL STATE ---
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // Safely extract arrays from liveData
  const incidents = liveData?.incidents || [];
  const ambulances = liveData?.ambulances || [];
  const hospitals = liveData?.hospitals || [];
  const currentStep = liveData?.step || 0;

  // --- 1. APPLY FILTERS ---
  const filteredIncidents = incidents.filter(inc => {
    const matchSeverity = severityFilter === 'All' || String(inc.severity || 1) === severityFilter;
    const matchStatus = statusFilter === 'All' || inc.status === statusFilter;
    return matchSeverity && matchStatus;
  });

  // Reset pagination if filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [severityFilter, statusFilter]);

  // --- 2. PAGINATION MATH ---
  const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentTableData = filteredIncidents.slice(indexOfFirstItem, indexOfLastItem);

  // --- 3. LIVE KPIs ---
  const activeIncidentsCount = incidents.length;
  const availableAmbulancesCount = ambulances.filter(a => a.status === 'IDLE').length;
  const overloadedHospitalsCount = hospitals.filter(h => h.queue > 5).length;

  const eventLog = incidents.slice(-5).reverse().map(inc => {
    return `Step ${currentStep} - Incident ${inc.id} (Severity ${inc.severity || 1}) is currently ${inc.status}.`;
  });

  // --- 4. HELPER: FIND ASSIGNED AMBULANCE ---
  const getAssignedAmbulance = (incidentId) => {
    return ambulances.find(a => a.assigned_incident === incidentId);
  };

  const handleClearSelection = () => {
    setSeverityFilter('All');
    setStatusFilter('All');
    setSelectedIncident(null);
    setCurrentPage(1);
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* LEFT COLUMN (Map, Table, Logs) */}
      <div style={{ flex: '7' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 20px 0' }}>Live Operations</h2>
        
        {/* LIVE MAP */}
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e0e0e0', borderRadius: '6px', height: '400px', position: 'relative', overflow: 'hidden', marginBottom: '30px' }}>
          <svg width="100%" height="100%" viewBox="0 0 20000 10000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="1000" height="1000" patternUnits="userSpaceOnUse">
                <path d="M 1000 0 L 0 0 0 1000" fill="none" stroke="#e0e0e0" strokeWidth="10"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* 1. Draw Hospitals */}
            {hospitals.map(h => (
              <g key={h.id}>
                <rect 
                  x={h.x - 5000 - 150} y={15000 - h.y - 150} 
                  width="300" height="300" 
                  fill={h.queue > 5 ? "#f03e3e" : h.queue > 2 ? "#fcc419" : "#51cf66"} 
                />
                <text x={h.x - 5000} y={15000 - h.y + 400} fontSize="250" fill="#333" textAnchor="middle" fontWeight="bold">
                  {h.id} ({h.queue})
                </text>
              </g>
            ))}

            {/* 2. Draw Filtered Incidents */}
            {filteredIncidents.map(inc => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <g key={inc.id} onClick={() => setSelectedIncident(inc)} style={{ cursor: 'pointer' }}>
                  {isSelected && (
                    <circle cx={inc.x - 5000} cy={15000 - inc.y} r="300" fill="none" stroke="#111" strokeWidth="40" strokeDasharray="100,50" />
                  )}
                  <circle 
                    cx={inc.x - 5000} cy={15000 - inc.y} 
                    r="150" 
                    fill={inc.status === 'PENDING' ? "#f03e3e" : "#fcc419"} 
                  />
                </g>
              );
            })}

            {/* 3. Draw Ambulances */}
            {ambulances.map(amb => (
              <g key={amb.id}>
                <circle 
                  cx={amb.x - 5000} cy={15000 - amb.y} 
                  r="200" 
                  fill={amb.status === 'IDLE' ? "#adb5bd" : "#4dabf7"} 
                />
                <text x={amb.x - 5000} y={15000 - amb.y - 300} fontSize="250" fill="#4dabf7" textAnchor="middle" fontWeight="bold">
                  {amb.id.replace('AMB_', 'A')}
                </text>
              </g>
            ))}
          </svg>

          {/* Map Legend */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: '#fff', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '5px' }}><span style={{color: '#f03e3e'}}>●</span> Incidents: Pending / Claimed</div>
            <div style={{ marginBottom: '5px' }}><span style={{color: '#4dabf7'}}>●</span> Ambulances: Active / <span style={{color: '#adb5bd'}}>Idle</span></div>
            <div style={{ marginBottom: '5px' }}><span style={{color: '#51cf66'}}>■</span> Hospitals: Queue Load</div>
          </div>
        </div>

        {/* ACTIVE INCIDENTS TABLE */}
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>Active Incidents (Filtered: {filteredIncidents.length})</h2>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', marginBottom: '30px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '12px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>ID</th>
                <th style={{ padding: '12px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>SPAWN STEP</th>
                <th style={{ padding: '12px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>SEVERITY</th>
                <th style={{ padding: '12px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? currentTableData.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <tr 
                    key={inc.id} 
                    onClick={() => setSelectedIncident(inc)}
                    style={{ 
                      borderBottom: '1px solid #f0f0f0', 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#fff9c4' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{inc.id}</td>
                    <td style={{ padding: '12px 20px' }}>Step {inc.spawn_step}</td>
                    <td style={{ padding: '12px 20px' }}>Level {inc.severity || 1}</td>
                    <td style={{ padding: '12px 20px', color: inc.status === 'PENDING' ? '#f03e3e' : '#fcc419', fontWeight: 'bold' }}>{inc.status}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No incidents match your current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* PAGINATION CONTROLS */}
          {filteredIncidents.length > ITEMS_PER_PAGE && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e0e0e0' }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{ padding: '6px 12px', border: '1px solid #e0e0e0', backgroundColor: currentPage === 1 ? '#f0f0f0' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px', fontSize: '0.8rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.8rem', color: '#555' }}>Page {currentPage} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ padding: '6px 12px', border: '1px solid #e0e0e0', backgroundColor: currentPage === totalPages ? '#f0f0f0' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '4px', fontSize: '0.8rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* EVENT LOG */}
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>Event Log</h2>
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '6px', backgroundColor: '#fff', padding: '10px' }}>
          {eventLog.length > 0 ? eventLog.map((event, i) => (
            <div key={i} style={{ padding: '12px', borderBottom: i !== eventLog.length - 1 ? '1px solid #f0f0f0' : 'none', fontSize: '0.85rem', color: '#555' }}>{event}</div>
          )) : (
            <div style={{ padding: '12px', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>Awaiting system events...</div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ flex: '3', backgroundColor: '#fff', padding: '25px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
        
        {/* CONTROLS */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>Controls</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <select style={selectStyle} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="All">Severity: All</option>
            <option value="1">Severity: 1</option>
            <option value="2">Severity: 2</option>
            <option value="3">Severity: 3</option>
            <option value="4">Severity: 4</option>
            <option value="5">Severity: 5</option>
          </select>
          <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">Status: All</option>
            <option value="PENDING">Status: PENDING</option>
            <option value="CLAIMED">Status: CLAIMED</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={handleClearSelection} style={{ flex: 1, padding: '10px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #e0e0e0', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }}>CLEAR SELECTION & FILTERS</button>
        </div>

        {/* KPIs */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>Live KPIs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <KPICard title="ACTIVE INCIDENTS" value={activeIncidentsCount} />
          <KPICard title="AVAILABLE FLEET" value={availableAmbulancesCount} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '30px' }}>
          <KPICard title="OVERLOADED HOSPITALS (>5 Pts)" value={overloadedHospitalsCount} />
          <KPICard title="SIMULATION STEP" value={currentStep} />
        </div>

        {/* SELECTED INCIDENT */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>Selected Incident</h2>
        {selectedIncident ? (
          <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: '#f9fafb', fontSize: '0.9rem' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#111' }}>{selectedIncident.id}</h3>
            <div style={{ marginBottom: '10px' }}><strong>Status:</strong> <span style={{ color: selectedIncident.status === 'PENDING' ? '#f03e3e' : '#fcc419' }}>{selectedIncident.status}</span></div>
            <div style={{ marginBottom: '10px' }}><strong>Severity Level:</strong> {selectedIncident.severity || 1}</div>
            <div style={{ marginBottom: '10px' }}><strong>Detected At:</strong> Step {selectedIncident.spawn_step}</div>
            <div style={{ marginBottom: '10px' }}><strong>X / Y Coords:</strong> {selectedIncident.x.toFixed(1)} / {selectedIncident.y.toFixed(1)}</div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '15px 0' }} />
            
            {selectedIncident.status === 'CLAIMED' ? (
              <div>
                <strong>Assigned Unit:</strong> <span style={{ color: '#4dabf7', fontWeight: 'bold' }}>{getAssignedAmbulance(selectedIncident.id)?.id || 'Dispatching...'}</span>
              </div>
            ) : (
              <div style={{ color: '#f03e3e', fontWeight: 'bold' }}>Awaiting Dispatch AI Assignment...</div>
            )}
          </div>
        ) : (
          <div style={{ padding: '20px', border: '1px dashed #e0e0e0', borderRadius: '4px', textAlign: 'center', color: '#888', fontSize: '0.85rem', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Select an incident on the map or table to view details.
          </div>
        )}

      </div>
    </div>
  );
};

// ==========================================
// VIEW 2: INCIDENTS QUEUE (MASTER LIST)
// ==========================================
const IncidentsView = ({ liveData }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  // Fetch closed/resolved incidents from the SQLite database
  useEffect(() => {
    fetch('http://localhost:8000/api/history')
      .then(res => res.json())
      .then(data => setHistoryData(data.history || []))
      .catch(err => console.error("Error fetching database history:", err));
  }, [liveData?.step]); // Re-fetch occasionally as the simulation progresses

  // 1. Format Active Incidents (from WebSocket)
  const activeIncidents = (liveData?.incidents || []).map(inc => ({
    id: inc.id,
    time: `Step ${inc.spawn_step}`,
    severity: inc.severity || 1,
    status: inc.status.toLowerCase(),
    x: inc.x,
    y: inc.y,
    assigned_unit: liveData?.ambulances?.find(a => a.assigned_incident === inc.id)?.id || 'None',
    raw: inc
  }));

  // 2. Format Closed Incidents (from SQLite)
  const closedIncidents = historyData.map(log => ({
    id: log.incident_id,
    time: `Step ${log.dispatch_step}`,
    severity: log.severity,
    status: 'closed',
    x: 'N/A', 
    y: 'N/A',
    assigned_unit: log.ambulance_id,
    resolved_step: log.resolved_step,
    raw: log
  }));

  // 3. Combine and sort them (newest first)
  const allIncidents = [...activeIncidents, ...closedIncidents].sort((a, b) => {
    // Simple sort to keep active ones at the top, or sort by ID
    if (a.status !== 'closed' && b.status === 'closed') return -1;
    if (a.status === 'closed' && b.status !== 'closed') return 1;
    return a.id > b.id ? -1 : 1;
  });

  // Card Style matching the Mockup
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '4px',
    borderTop: '4px solid #ffdd00',
    borderLeft: '1px solid #e0e0e0',
    borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* LEFT COLUMN: Incidents Queue */}
      <div style={{ flex: '7', ...cardStyle }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 20px 0', color: '#111' }}>Incidents Queue</h2>
        
        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>ID</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>TIME</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>SEVERITY</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>STATUS</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>REGION</th>
              </tr>
            </thead>
            <tbody>
              {allIncidents.length > 0 ? allIncidents.map((inc, i) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <tr 
                    key={`${inc.id}-${i}`} 
                    onClick={() => setSelectedIncident(inc)}
                    style={{ 
                      borderBottom: '1px solid #f0f0f0', 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#fff9c4' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ padding: '15px 20px', color: '#333' }}>{inc.id}</td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>{inc.time}</td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                        backgroundColor: inc.severity >= 4 ? '#ffe3e3' : inc.severity === 3 ? '#fff3bf' : '#e7f5ff',
                        color: inc.severity >= 4 ? '#c92a2a' : inc.severity === 3 ? '#e67700' : '#1864ab'
                      }}>
                        {inc.severity >= 4 ? 'high' : inc.severity === 3 ? 'medium' : 'low'}
                      </span>
                    </td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>
                      <span style={{
                        color: inc.status === 'closed' ? '#868e96' : inc.status === 'pending' ? '#f03e3e' : '#fcc419',
                        fontWeight: inc.status !== 'closed' ? 'bold' : 'normal'
                      }}>
                        {inc.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>
                      {inc.x !== 'N/A' ? `X: ${(inc.x).toFixed(0)}` : 'Logged'}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No incidents recorded in the system yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: Incident Details */}
      <div style={{ flex: '3', ...cardStyle, position: 'sticky', top: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 20px 0', color: '#111' }}>Incident Details</h2>
        
        {selectedIncident ? (
          <div style={{ fontSize: '0.9rem', color: '#444', lineHeight: '1.8' }}>
            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Incident ID</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111' }}>{selectedIncident.id}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>Status:</strong> 
              <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: selectedIncident.status === 'closed' ? '#868e96' : selectedIncident.status === 'pending' ? '#f03e3e' : '#fcc419' }}>
                {selectedIncident.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>Severity:</strong> <span>Level {selectedIncident.severity}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>Timestamp:</strong> <span>{selectedIncident.time}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>Assigned Unit:</strong> 
              <span style={{ fontWeight: 'bold', color: selectedIncident.assigned_unit !== 'None' ? '#4dabf7' : '#888' }}>
                {selectedIncident.assigned_unit}
              </span>
            </div>

            {selectedIncident.status === 'closed' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
                <strong>Resolved At:</strong> <span>Step {selectedIncident.resolved_step}</span>
              </div>
            )}
            
          </div>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: '0.9rem', border: '1px dashed #e0e0e0', borderRadius: '4px' }}>
            Select an incident from the queue to view full dispatch details and telemetry.
          </div>
        )}
      </div>

    </div>
  );
};


// ==========================================
// VIEW 3: FLEET MANAGEMENT
// ==========================================
const FleetView = ({ liveData }) => {
  const ambulances = liveData?.ambulances || [];

  // --- 1. CALCULATE STATUS DISTRIBUTION ---
  const statusCounts = {
    IDLE: 0,
    RESPONDING: 0,
    ON_SITE: 0,
    TRANSPORTING: 0
  };

  ambulances.forEach(amb => {
    if (statusCounts[amb.status] !== undefined) {
      statusCounts[amb.status]++;
    } else {
      statusCounts['IDLE']++; // Fallback
    }
  });

  const totalAmbulances = ambulances.length || 1; // Prevent division by zero

  // --- 2. GENERATE PURE CSS PIE CHART ---
  const colors = {
    IDLE: '#51cf66',        // Green (Standby/Available)
    RESPONDING: '#4dabf7',  // Blue (En Route to Incident)
    ON_SITE: '#fcc419',     // Yellow (On Scene)
    TRANSPORTING: '#f03e3e' // Red (En Route to Hospital)
  };

  let cumulativePercent = 0;
  const gradientStops = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => {
      const percent = (count / totalAmbulances) * 100;
      const start = cumulativePercent;
      const end = cumulativePercent + percent;
      cumulativePercent = end;
      return `${colors[status]} ${start}% ${end}%`;
    })
    .join(', ');

  const pieBackground = gradientStops ? `conic-gradient(${gradientStops})` : '#f0f0f0';

  // --- 3. STYLES ---
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '4px',
    borderTop: '4px solid #ffdd00',
    borderLeft: '1px solid #e0e0e0',
    borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  };

  // Generate a mock utilization percentage based on the ambulance ID number 
  // (Since we don't track historical utilization per rig yet, this provides the visual realism for your mockup)
  const getMockUtilization = (id) => {
    const num = parseInt(id.replace('AMB_', ''), 10) || 0;
    return `${Math.min(15 + (num * 12), 95)}%`; 
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* LEFT COLUMN: Fleet Status Table */}
      <div style={{ flex: '7', ...cardStyle }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 20px 0', color: '#111' }}>Fleet Status</h2>
        
        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>AMBULANCE</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>STATUS</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>ASSIGNMENT</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>UTILIZATION</th>
              </tr>
            </thead>
            <tbody>
              {ambulances.length > 0 ? ambulances.map((amb, i) => (
                <tr key={amb.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>{amb.id.replace('AMB_', 'A')}</td>
                  <td style={{ padding: '15px 20px', color: '#555' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px', height: '8px', borderRadius: '50%',
                      backgroundColor: colors[amb.status],
                      marginRight: '8px'
                    }}></span>
                    {amb.status.toLowerCase().replace('_', ' ')}
                  </td>
                  <td style={{ padding: '15px 20px', color: '#555' }}>
                    {amb.assigned_incident || 'None'}
                  </td>
                  <td style={{ padding: '15px 20px', color: '#555' }}>
                    {getMockUtilization(amb.id)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Waiting for fleet telemetry...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: Pie Chart Distribution */}
      <div style={{ flex: '3', ...cardStyle, position: 'sticky', top: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 20px 0', color: '#111' }}>Status Distribution</h2>
        
        {/* The Pure CSS Pie Chart */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <div style={{ 
            width: '200px', 
            height: '200px', 
            borderRadius: '50%', 
            background: pieBackground,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}></div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: '30px' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: colors[status] }}></div>
                <span style={{ textTransform: 'capitalize', color: '#555' }}>{status.toLowerCase().replace('_', ' ')}</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#111' }}>{count}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};


// ==========================================
// VIEW 4: HOSPITALS (OVERLOAD MONITORING)
// ==========================================
const HospitalsView = ({ liveData }) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);

  const hospitals = liveData?.hospitals || [];
  const ambulances = liveData?.ambulances || [];

  // --- 1. CALCULATE METRICS ---
  // A helper to derive status, score, inbound, and wait time from the raw queue
  const getHospitalMetrics = (hosp) => {
    // Assuming a max capacity baseline of ~15 patients for a score of 1.0
    const rawScore = hosp.queue / 15;
    const score = Math.min(rawScore, 1).toFixed(2); 
    
    let status = 'normal';
    let statusColor = '#51cf66';
    if (score >= 0.8) {
      status = 'overloaded';
      statusColor = '#f03e3e';
    } else if (score >= 0.5) {
      status = 'busy';
      statusColor = '#fcc419';
    }

    // Mock inbound count by finding ambulances currently transporting (could be refined further)
    const inbound = ambulances.filter(a => a.status === 'TRANSPORTING').length % 3; // Mock distribution
    
    // Estimate wait time: roughly 12 mins per patient in queue
    const estWait = hosp.queue === 0 ? '0m' : `${(hosp.queue * 12) + 5}m`;

    return { score, status, statusColor, inbound, estWait };
  };

  // Set default selected hospital if none is selected
  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId]);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const selectedMetrics = selectedHospital ? getHospitalMetrics(selectedHospital) : null;

  // --- 2. GENERATE SVG CHART HISTORY ---
  // To make it look like the mockup, we generate a smooth mock-history path ending at the current live score.
  const generateChartPath = (currentScore) => {
    const s = parseFloat(currentScore);
    // Y-axis inverted for SVG (0 is top, 150 is bottom)
    const yTarget = 150 - (s * 150); 
    
    // Create a smooth bezier curve path ending at our live score
    return `M 0 ${150 - (Math.max(0, s - 0.3) * 150)} 
            C 50 ${150 - (Math.max(0, s - 0.2) * 150)}, 
              100 ${150 - (Math.max(0, s - 0.1) * 150)}, 
              150 ${150 - (Math.max(0, s - 0.15) * 150)} 
            S 250 ${yTarget}, 300 ${yTarget}`;
  };

  // --- 3. STYLES ---
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '4px',
    borderTop: '4px solid #ffdd00',
    borderLeft: '1px solid #e0e0e0',
    borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* LEFT COLUMN: Hospitals Table */}
      <div style={{ flex: '7', ...cardStyle }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 20px 0', color: '#111' }}>Hospitals (Overload Monitoring)</h2>
        
        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>HOSPITAL</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>STATUS</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>SCORE</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>INBOUND</th>
                <th style={{ padding: '15px 20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#111' }}>EST. WAIT</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.length > 0 ? hospitals.map((hosp) => {
                const metrics = getHospitalMetrics(hosp);
                const isSelected = selectedHospitalId === hosp.id;
                
                return (
                  <tr 
                    key={hosp.id} 
                    onClick={() => setSelectedHospitalId(hosp.id)}
                    style={{ 
                      borderBottom: '1px solid #f0f0f0', 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#fff9c4' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>{hosp.id}</td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>{metrics.status}</td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>{metrics.score}</td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>{metrics.inbound}</td>
                    <td style={{ padding: '15px 20px', color: '#555' }}>{metrics.estWait}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Waiting for hospital telemetry...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: Hospital Detail & Chart */}
      <div style={{ flex: '3', ...cardStyle, position: 'sticky', top: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 20px 0', color: '#111' }}>Hospital Detail</h2>
        
        {selectedHospital && selectedMetrics ? (
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#111', textTransform: 'uppercase' }}>{selectedHospital.id}</h3>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>
              Status: <span style={{ color: selectedMetrics.statusColor, fontWeight: 'bold' }}>{selectedMetrics.status}</span> • Score: {selectedMetrics.score}
            </div>

            <button style={{ 
              padding: '8px 16px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #e0e0e0', 
              backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer', marginBottom: '40px' 
            }}>
              DIVERT (MOCK)
            </button>

            {/* PURE SVG LINE CHART */}
            <div style={{ position: 'relative', width: '100%', height: '180px' }}>
              <svg width="100%" height="100%" viewBox="0 -10 320 180" style={{ overflow: 'visible' }}>
                
                {/* Y-Axis Guidelines & Labels */}
                <line x1="20" y1="0" x2="320" y2="0" stroke="#f0f0f0" strokeWidth="1" />
                <text x="10" y="4" fontSize="10" fill="#888" textAnchor="end">1</text>
                
                <line x1="20" y1="37.5" x2="320" y2="37.5" stroke="#f0f0f0" strokeWidth="1" />
                <text x="10" y="41.5" fontSize="10" fill="#888" textAnchor="end">0.75</text>
                
                <line x1="20" y1="75" x2="320" y2="75" stroke="#f0f0f0" strokeWidth="1" />
                <text x="10" y="79" fontSize="10" fill="#888" textAnchor="end">0.5</text>
                
                <line x1="20" y1="112.5" x2="320" y2="112.5" stroke="#f0f0f0" strokeWidth="1" />
                <text x="10" y="116.5" fontSize="10" fill="#888" textAnchor="end">0.25</text>

                <line x1="20" y1="150" x2="320" y2="150" stroke="#ccc" strokeWidth="1" />
                <text x="10" y="154" fontSize="10" fill="#888" textAnchor="end">0</text>

                {/* X-Axis Labels (Mock Time) */}
                <text x="20" y="165" fontSize="10" fill="#888" textAnchor="middle">08:00</text>
                <text x="95" y="165" fontSize="10" fill="#888" textAnchor="middle">08:10</text>
                <text x="170" y="165" fontSize="10" fill="#888" textAnchor="middle">08:20</text>
                <text x="245" y="165" fontSize="10" fill="#888" textAnchor="middle">08:30</text>
                <text x="320" y="165" fontSize="10" fill="#888" textAnchor="middle">08:40</text>

                {/* Data Line */}
                <path 
                  d={generateChartPath(selectedMetrics.score)} 
                  fill="none" 
                  stroke="#4dabf7" 
                  strokeWidth="2" 
                />
              </svg>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: '0.9rem', border: '1px dashed #e0e0e0', borderRadius: '4px' }}>
            Select a hospital to view historical load telemetry.
          </div>
        )}
      </div>

    </div>
  );
};


// ==========================================
// VIEW 6: ANALYTICS & BENCHMARKING (FINAL NOTEBOOK RESULTS)
// ==========================================
const AnalyticsView = () => {
  // Data transcribed exactly from the Jupyter Notebook 1-Hour Extended Lifecycle Metrics
  const extendedMetrics = [
    { policy: '0 | Random-Idle', total: 180, active: 85, claimed: 95, resolved: 95, timeouts: 13, meanRT: 895.19, p90RT: 1919.52, util: 0.955 },
    { policy: '1 | Nearest-Idle', total: 180, active: 87, claimed: 93, resolved: 93, timeouts: 12, meanRT: 826.45, p90RT: 1869.30, util: 0.931 },
    { policy: '2 | Severity-Priority', total: 180, active: 82, claimed: 98, resolved: 98, timeouts: 5, meanRT: 629.85, p90RT: 1350.35, util: 0.931 },
    { policy: '3 | DQN-MARL (Integrated)', total: 180, active: 77, claimed: 103, resolved: 103, timeouts: 12, meanRT: 747.64, p90RT: 1838.49, util: 0.940 },
  ];

  // --- STYLES ---
  const cardStyle = {
    backgroundColor: '#fff', borderRadius: '4px', borderTop: '4px solid #ffdd00',
    borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    marginBottom: '30px'
  };

  const imgContainerStyle = {
    width: '100%', height: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', 
    backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, color: '#111' }}>Analytics & Benchmarking</h2>
        <div style={{ padding: '8px 12px', fontSize: '0.85rem', backgroundColor: '#e6fcf5', color: '#0ca678', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #63e6be' }}>
          Source: 1-Hour Extended Simulation
        </div>
      </div>

      {/* KPI COMPARISON ROW */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        <div style={{ flex: 1, ...cardStyle, marginBottom: 0 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 20px 0', color: '#111' }}>Incidents Resolved (Higher is Better)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <KPICard title="0 | RANDOM" value="95" />
            <KPICard title="1 | NEAREST" value="93" />
            <KPICard title="2 | SEVERITY" value="98" />
            <div style={{ border: '2px solid #37b24d', borderRadius: '4px', padding: '15px 10px', backgroundColor: '#ebfbee', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#37b24d', color: 'white', fontSize: '0.6rem', padding: '4px 8px', borderRadius: '10px', fontWeight: 'bold' }}>BEST</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#2b8a3e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>3 | DQN-MARL</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#111' }}>103</div>
            </div>
          </div>
        </div>
      </div>

      {/* EXTENDED METRICS TABLE */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 15px 0', color: '#111' }}>Extended Lifecycle Metrics</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>Policy</th>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>Inc Total</th>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>Inc Active</th>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>Inc Claimed/Resolved</th>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>Timeouts</th>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>Mean RT (s)</th>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>P90 RT (s)</th>
                <th style={{ padding: '12px', fontWeight: 'bold', color: '#111' }}>Fleet Util</th>
              </tr>
            </thead>
            <tbody>
              {extendedMetrics.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: row.policy.includes('DQN') ? '#f4fce3' : 'transparent' }}>
                  <td style={{ padding: '12px', fontWeight: row.policy.includes('DQN') ? 'bold' : 'normal', color: '#333' }}>{row.policy}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{row.total}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{row.active}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: row.policy.includes('DQN') ? '#2b8a3e' : '#111' }}>{row.resolved}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{row.timeouts}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{row.meanRT}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{row.p90RT}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{row.util}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISUALIZATIONS GRID */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '30px 0 15px 0', color: '#111' }}>Performance Visualizations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
        
        {/* Chart 1: P90 */}
        <div style={{ ...cardStyle, marginBottom: 0, padding: '15px' }}>
          <div style={imgContainerStyle}>
            <img src="/p90-chart.png" alt="90th Percentile Response Time by Policy" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>

        {/* Chart 2: Distribution */}
        <div style={{ ...cardStyle, marginBottom: 0, padding: '15px' }}>
          <div style={imgContainerStyle}>
            <img src="/distribution-chart.png" alt="Distribution of Emergency Response Times" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>

        {/* Chart 3: Fleet Utilization */}
        <div style={{ ...cardStyle, marginBottom: 0, padding: '15px' }}>
          <div style={imgContainerStyle}>
            <img src="/utilization-chart.png" alt="Mean Fleet Utilization by Policy" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>

        {/* Chart 4: Fleet Status */}
        <div style={{ ...cardStyle, marginBottom: 0, padding: '15px' }}>
          <div style={imgContainerStyle}>
            <img src="/fleet-status-chart.png" alt="Ambulance Fleet Status Breakdown" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>

      </div>

    </div>
  );
};

// --- HELPER COMPONENTS & STYLES ---

const NavItem = ({ icon, label, isActive, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', 
      cursor: 'pointer', fontSize: '0.9rem', fontWeight: isActive ? 'bold' : 'normal',
      backgroundColor: isActive ? '#fff9c4' : 'transparent',
      borderLeft: isActive ? '4px solid #fcc419' : '4px solid transparent',
      color: '#333', transition: 'background-color 0.2s'
    }}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const KPICard = ({ title, value }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '15px 10px', position: 'relative' }}>
    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fcc419' }}></div>
    <div style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: '900' }}>{value}</div>
  </div>
);

const selectStyle = {
  flex: 1, padding: '8px', fontSize: '0.8rem', border: '1px solid #e0e0e0', 
  borderRadius: '4px', backgroundColor: '#fff', outline: 'none'
};