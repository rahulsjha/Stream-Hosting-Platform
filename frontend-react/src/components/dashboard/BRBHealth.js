import React from 'react';
import './styles.css';

const BRBHealth = () => (
  <div className="card glass-card">
    <div className="card-title">BRB / Stream Health</div>
    <div className="card-sub">Realtime health metrics for your stream endpoints.</div>
    <div style={{ padding: '12px 0' }}>
      <p style={{ margin: 0 }}>Latency: <strong>—</strong></p>
      <p style={{ margin: 0 }}>Packet Loss: <strong>—</strong></p>
      <p style={{ margin: 0 }}>Restream Status: <strong>—</strong></p>
    </div>
  </div>
);

export default BRBHealth;
