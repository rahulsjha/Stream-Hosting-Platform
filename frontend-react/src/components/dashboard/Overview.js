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
              <i className="fab fa-twitch"></i>
            </div>
            <div className="pt-name">Twitch</div>
            <div className="pt-status">OFF</div>
          </button>

          <button className="platform-tile" onClick={() => {}}>
            <span className="pt-check">✓</span>
            <div className="pt-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="pt-name">Kick</div>
            <div className="pt-status">OFF</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
