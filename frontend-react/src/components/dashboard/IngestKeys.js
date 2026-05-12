import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api/endpoints';

const IngestKeys = () => {
  const { user } = useAuth();
  const [streamKey, setStreamKey] = useState('');
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [srtUrl, setSrtUrl] = useState('');

  useEffect(() => {
    loadIngestInfo();
  }, []);

  const loadIngestInfo = async () => {
    try {
      const profile = await userAPI.getProfile?.() || {};
      const newUserData = localStorage.getItem('sil_newuser');
      if (newUserData) {
        const data = JSON.parse(newUserData);
        setStreamKey(data.stream_key);
        setRtmpUrl(data.rtmp_ingest);
        setSrtUrl(data.srt_ingest);
      } else if (profile.stream_key) {
        setStreamKey(profile.stream_key);
      }
    } catch (error) {
      console.error('Failed to load ingest info:', error);
    }
  };

  const copyToClipboard = (text) => {
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
          {/* Stream Key */}
          <div className="form-group">
            <label>Stream Key</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={streamKey}
                readOnly
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
          </div>

          {/* RTMP URL */}
          <div className="form-group">
            <label>RTMP Ingest URL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={rtmpUrl}
                readOnly
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
                value={srtUrl}
                readOnly
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

          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(0, 229, 160, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--dash-accent)' }}>
            <p style={{ fontSize: '13px', color: 'var(--dash-text)' }}>
              <strong>Keep these secret!</strong> Don't share your stream key publicly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngestKeys;
