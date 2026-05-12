import React, { useState } from 'react';
import { mediaAPI } from '../../api/endpoints';

const BRBHealth = () => {
  const [brbEnabled, setBrbEnabled] = useState(false);
  const [brbTimeout, setBrbTimeout] = useState(300);
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await mediaAPI.uploadBRB(file);
      setMediaFile(file.name);
      alert('BRB media uploaded successfully!');
    } catch (error) {
      alert('Failed to upload BRB media');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBRB = async () => {
    if (window.confirm('Delete BRB media?')) {
      try {
        await mediaAPI.deleteBRB();
        setMediaFile(null);
        alert('BRB media deleted');
      } catch (error) {
        alert('Failed to delete BRB media');
      }
    }
  };

  return (
    <div className="section-brb">
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-shield-halved"></i> BRB / Health Settings
          </h3>
          <span className="subtitle">Auto-recovery when stream drops</span>
        </div>

        <div style={{ maxWidth: '600px' }}>
          {/* BRB Enable */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--dash-border)' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Enable BRB</div>
              <div style={{ fontSize: '12px', color: 'var(--dash-muted)', marginTop: '2px' }}>Show BRB media when stream drops</div>
            </div>
            <input
              type="checkbox"
              checked={brbEnabled}
              onChange={(e) => setBrbEnabled(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          {/* BRB Timeout */}
          <div className="form-group">
            <label htmlFor="brb_timeout">BRB Timeout (seconds)</label>
            <input
              id="brb_timeout"
              type="number"
              min="10"
              max="3600"
              value={brbTimeout}
              onChange={(e) => setBrbTimeout(Number(e.target.value))}
            />
            <small style={{ color: 'var(--dash-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Time to wait before showing BRB media after stream drops
            </small>
          </div>

          {/* BRB Media Upload */}
          <div className="form-group">
            <label htmlFor="brb_media">BRB Media File</label>
            <input
              id="brb_media"
              type="file"
              accept=".mp4,.mov,.jpg,.png,.webm"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <small style={{ color: 'var(--dash-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              MP4, MOV, WEBM (video) or JPG, PNG (image). Max 100MB.
            </small>

            {mediaFile && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--dash-card2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px' }}>
                  <i className="fa-solid fa-check" style={{ color: 'var(--dash-accent)', marginRight: '6px' }}></i>
                  {mediaFile}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDeleteBRB}
                >
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={uploading}
            onClick={() => {}}
          >
            {uploading ? 'Uploading...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Health Monitoring */}
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-heartbeat"></i> Stream Health
          </h3>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Uptime</div>
            <div className="value">99.9%</div>
            <div className="sub">Last 30 days</div>
          </div>

          <div className="stat-card">
            <div className="label">Avg Bitrate</div>
            <div className="value">5.2M</div>
            <div className="sub">Current stream</div>
          </div>

          <div className="stat-card">
            <div className="label">Dropped Frames</div>
            <div className="value">0</div>
            <div className="sub">Last hour</div>
          </div>

          <div className="stat-card">
            <div className="label">Last Check</div>
            <div className="value">2m</div>
            <div className="sub">ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BRBHealth;
