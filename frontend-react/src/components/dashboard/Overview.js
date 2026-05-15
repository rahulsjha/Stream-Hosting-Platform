import React, { useState, useEffect } from 'react';
import { userAPI } from '../../api/endpoints';

const Overview = ({ userData }) => {
  const [profile, setProfile] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile?.() || {};
      setProfile(response);
      setIsLive(response.is_live || false);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  return (
    <div className="section-overview">
      {/* Live Status */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <h3>
            <i className="fa-solid fa-signal"></i> Stream Status
          </h3>
        </div>

        <div className="stats-grid">
          <div className="stat-card live">
            <div className="label">Status</div>
            <div className="value">{isLive ? 'LIVE' : 'OFFLINE'}</div>
          </div>

          <div className="stat-card">
            <div className="label">Plan</div>
            <div className="value">{profile?.plan?.toUpperCase() || 'FREE'}</div>
          </div>

          <div className="stat-card accent">
            <div className="label">Stream Hours</div>
            <div className="value">{profile?.total_stream_hours ? `${parseFloat(profile.total_stream_hours).toFixed(1)}h` : '0h'}</div>
          </div>

          <div className="stat-card">
            <div className="label">Streams</div>
            <div className="value">12</div>
          </div>
        </div>
      </div>
      {/* Platform Status */}
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-satellite-dish"></i> Stream To
          </h3>
          <span className="subtitle">Click to toggle platforms</span>
        </div>

        <div className="platform-grid">
          <button className="platform-tile active" onClick={() => {}}>
            <span className="pt-check">✓</span>
            <div className="pt-icon">
              <i className="fab fa-youtube"></i>
            </div>
            <div className="pt-name">YouTube</div>
            <div className="pt-status">ON</div>
          </button>

          <button className="platform-tile" onClick={() => {}}>
            <span className="pt-check">✓</span>
            <div className="pt-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="pt-name">Kick</div>
            <div className="pt-status">OFF</div>
          </button>

          <button className="platform-tile" onClick={() => {}}>
            <span className="pt-check">✓</span>
            <div className="pt-icon">
              <i className="fab fa-twitch"></i>
            </div>
            <div className="pt-name">Twitch</div>
            <div className="pt-status">OFF</div>
          </button>
        </div>
      </div>

      {/* Stats Grid copied from original dashboard.html */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="label">Status</div>
          <div className="value">—</div>
          <div className="sub"></div>
        </div>
        <div className="stat-card">
          <div className="label">Active Destinations</div>
          <div className="value">0</div>
          <div className="sub">platforms receiving your stream</div>
        </div>
        <div className="stat-card">
          <div className="label">Plan</div>
          <div className="value">—</div>
          <div className="sub"></div>
        </div>
        <div className="stat-card">
          <div className="label">Total Hours</div>
          <div className="value">—</div>
          <div className="sub">streamed lifetime</div>
        </div>
      </div>

      {/* Two column: Live Stream + Quick Start */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>Live Stream</h3>
            <span style={{ fontSize: '.75rem', color: 'var(--dash-muted)' }}></span>
          </div>
          <div id="liveInfo">
            <p style={{ color: 'var(--dash-muted)' }}>No active stream. Connect your encoder to go live.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Quick Start</h3></div>
          <ol style={{ paddingLeft: '18px', lineHeight: 2, color: 'var(--dash-muted)', fontSize: '.85rem' }}>
            <li>Configure <a href="#" onClick={(e) => { e.preventDefault(); /* navigate to destinations */ }}>destinations</a> (YouTube, Kick, Twitch)</li>
            <li>Copy your <a href="#" onClick={(e) => { e.preventDefault(); /* navigate to ingest */ }}>ingest URL &amp; key</a></li>
            <li>Open OBS → Settings → Stream → Custom</li>
            <li>Paste URL &amp; stream key → Go Live ✓</li>
          </ol>
        </div>
      </div>

      {/* WebSocket Feed Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header"><h3>WebSocket Live Feed</h3></div>
        <div id="wsFeed" className="ws-feed">
          Waiting for events…
        </div>
      </div>
    </div>
  );
};

export default Overview;
