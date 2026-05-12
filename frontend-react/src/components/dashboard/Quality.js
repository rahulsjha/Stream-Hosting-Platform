import React from 'react';

const Quality = () => {
  return (
    <div className="section-quality">
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-sliders"></i> Recommended Stream Settings
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--dash-border)' }}>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', fontSize: '13px' }}>Setting</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', fontSize: '13px' }}>Value</th>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', fontSize: '13px' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--dash-border)' }}>
              <td style={{ padding: '12px', fontSize: '13px' }}>Resolution</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-accent)', fontWeight: '600' }}>1080p (1920x1080)</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-muted)' }}>or 720p for lower bandwidth</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--dash-border)' }}>
              <td style={{ padding: '12px', fontSize: '13px' }}>Frame Rate</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-accent)', fontWeight: '600' }}>60 FPS</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-muted)' }}>30 FPS minimum</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--dash-border)' }}>
              <td style={{ padding: '12px', fontSize: '13px' }}>Bitrate</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-accent)', fontWeight: '600' }}>6000 kbps</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-muted)' }}>Adjust based on upload speed</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--dash-border)' }}>
              <td style={{ padding: '12px', fontSize: '13px' }}>Encoder</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-accent)', fontWeight: '600' }}>H.264</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-muted)' }}>NVIDIA NVENC if available</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontSize: '13px' }}>Audio</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-accent)', fontWeight: '600' }}>128 kbps AAC</td>
              <td style={{ padding: '12px', fontSize: '13px', color: 'var(--dash-muted)' }}>44.1 kHz sample rate</td>
            </tr>
          </tbody>
        </table>

        <h4 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: '600' }}>Network Requirements</h4>
        <div style={{ background: 'var(--dash-card2)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--dash-info)' }}>
          <ul style={{ marginLeft: '20px', color: 'var(--dash-text)', fontSize: '13px', lineHeight: '1.8' }}>
            <li>Upload Speed: Minimum 8 Mbps for 1080p60</li>
            <li>Latency: &lt; 100ms recommended</li>
            <li>Packet Loss: &lt; 1%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Quality;
