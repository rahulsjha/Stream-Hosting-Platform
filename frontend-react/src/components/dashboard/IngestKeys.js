import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api/endpoints';

const IngestKeys = () => {
  const { user } = useAuth();
  const [streamKey, setStreamKey] = useState('');
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [srtUrl, setSrtUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const applyIngestInfo = useCallback((profile = {}) => {
    setStreamKey(profile.stream_key || profile.rtmp_stream_key || '');
    setRtmpUrl(profile.rtmp_ingest || profile.rtmp_server || '');
    setSrtUrl(profile.srt_ingest || '');
  }, []);

  const loadIngestInfo = useCallback(async () => {
    try {
      if (!user?.username) return;
      applyIngestInfo(user);

      const savedNewUser = localStorage.getItem('sil_newuser');
      if (savedNewUser) {
        try {
          applyIngestInfo(JSON.parse(savedNewUser));
        } catch {
          // Ignore malformed local cache and continue with live profile fetch.
        }
      }

      const response = await userAPI.getProfile();
      const profile = response.data || {};
      applyIngestInfo(profile);
    } catch (error) {
      console.error('Failed to load ingest info:', error);
    }
  }, [applyIngestInfo, user]);

  useEffect(() => {
    loadIngestInfo();
  }, [loadIngestInfo]);

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerate your stream key? Your encoder will need the new key immediately.')) return;
    setRefreshing(true);
    try {
      const response = await userAPI.regenerateStreamKey();
      const data = response.data || {};
      setStreamKey(data.stream_key || '');
      setRtmpUrl(data.rtmp_ingest || '');
      setSrtUrl('');
      alert('Stream key regenerated successfully');
    } catch (error) {
      alert('Failed to regenerate stream key');
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="section-ingest">
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-key"></i> Ingest URLs
          </h3>
          <span className="subtitle">Use these in your encoder (OBS, etc.)</span>
        </div>

        <div style={{ maxWidth: '600px' }}>
          {/* OBS Configuration Instructions */}
          <div style={{ 
            padding: '12px', 
            marginBottom: '16px', 
            backgroundColor: '#f0f0f0', 
            borderLeft: '4px solid #007bff',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>OBS Configuration:</strong>
            <ol style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
              <li>Go to <strong>Settings → Stream</strong></li>
              <li>Service: <strong>Custom...</strong></li>
              <li>Server: Copy the RTMP Server URL below</li>
              <li>Stream Key: Copy the Stream Key below</li>
              <li>Apply and start streaming</li>
            </ol>
          </div>

          {/* RTMP Server URL (for Server field in OBS) */}
          <div className="form-group">
            <label>RTMP Server (for OBS "Server" field)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="ingest-display-input"
                value={rtmpUrl ? rtmpUrl.replace(/\/[^\/]*$/, '') : ''}
                placeholder="RTMP server URL"
                readOnly
                tabIndex={-1}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(rtmpUrl ? rtmpUrl.replace(/\/[^\/]*$/, '') : '')}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>e.g. rtmp://34.46.51.228:1935/live</small>
          </div>

          {/* Stream Key */}
          <div className="form-group">
            <label>Stream Key (for OBS "Stream Key" field)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="ingest-display-input"
                value={streamKey}
                placeholder="Stream key will appear here"
                readOnly
                tabIndex={-1}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(streamKey)}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Only this key, NOT the full URL</small>
          </div>

          {/* Full RTMP URL (for reference) */}
          <div className="form-group">
            <label>Full RTMP URL (for reference)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="ingest-display-input"
                value={rtmpUrl}
                placeholder="RTMP ingest URL will appear here"
                readOnly
                tabIndex={-1}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(rtmpUrl)}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
          </div>

          {/* SRT URL */}
          <div className="form-group">
            <label>SRT Ingest URL (SRT Protocol)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="ingest-display-input"
                value={srtUrl}
                placeholder="SRT ingest URL will appear here"
                readOnly
                tabIndex={-1}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(srtUrl)}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRegenerateKey}
            disabled={refreshing}
            style={{ marginBottom: '16px' }}
          >
            {refreshing ? 'Regenerating...' : 'Regenerate Stream Key'}
          </button>

          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(0, 229, 160, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--dash-accent)' }}>
            <p style={{ fontSize: '13px', color: 'var(--dash-text)' }}>
              <strong>Keep these secret!</strong> Don't share your stream key publicly.
            </p>
          </div>

          <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '13px', color: 'var(--dash-text)', marginBottom: '8px' }}>
              <strong>OBS Studio setup</strong>
            </p>
            <p style={{ fontSize: '12px', color: 'var(--dash-muted)', lineHeight: 1.6, marginBottom: '6px' }}>
              In OBS, choose <strong>Settings</strong> → <strong>Stream</strong> → <strong>Service: Custom</strong>.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--dash-muted)', lineHeight: 1.6, marginBottom: '6px' }}>
              Set <strong>Server</strong> to <code>rtmp://34.46.51.228:1935/live</code> and paste the key from above into <strong>Stream Key</strong>.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--dash-muted)', lineHeight: 1.6 }}>
              Then click <strong>Apply</strong> and <strong>Start Streaming</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngestKeys;
