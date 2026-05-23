import React, { useEffect, useMemo, useState } from 'react';
import { userAPI } from '../../api/endpoints';

const Overview = ({ profile: initialProfile, sessionCount = 0, liveDuration = '—', onNavigateSection }) => {
  const [profile, setProfile] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadDashboardData = async () => {
      try {
        const sessionsResponse = initialProfile?.username
          ? await userAPI.getSessions(initialProfile.username)
          : { data: [] };

        if (!alive) return;

        setProfile(initialProfile || null);
        setRecentSessions(Array.isArray(sessionsResponse.data) ? sessionsResponse.data.slice(0, 3) : []);
      } catch (error) {
        if (alive) {
          console.error('Failed to load dashboard overview:', error);
          setProfile(initialProfile || null);
          setRecentSessions([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      alive = false;
    };
  }, [initialProfile]);

  const destinationCards = useMemo(() => ([
    {
      label: 'YouTube',
      enabled: !!profile?.stream_to_youtube,
      url: profile?.youtube_url,
      icon: 'https://cdn.simpleicons.org/youtube/FF0000',
    },
    {
      label: 'Twitch',
      enabled: !!profile?.stream_to_twitch,
      url: profile?.twitch_url,
      icon: 'https://cdn.simpleicons.org/twitch/9146FF',
    },
    {
      label: 'Kick',
      enabled: !!profile?.stream_to_kick,
      url: profile?.kick_url,
      icon: 'https://cdn.simpleicons.org/kick/53FC18',
    },
  ]), [profile]);

  const activeDestinations = destinationCards.filter((item) => item.enabled).length;

  const formatStoredValue = (value) => {
    if (!value) return 'Not saved yet';
    const trimmed = String(value).trim();
    if (trimmed.length <= 38) return trimmed;
    return `${trimmed.slice(0, 22)}…${trimmed.slice(-12)}`;
  };

  const formatTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined || seconds === '') return '—';
    const total = Number(seconds);
    if (Number.isNaN(total)) return '—';
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    return `${minutes}m`;
  };

  return (
    <div className="section-overview">
      {loading ? (
        <div className="card">
          <p style={{ color: 'var(--dash-muted)' }}>Loading dashboard overview...</p>
        </div>
      ) : null}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-signal"></i> Stream Status
          </h3>
        </div>

        <div className="stats-grid">
          <div className="stat-card live">
            <div className="label">Status</div>
            <div className="value">{profile?.is_live ? 'LIVE' : 'OFFLINE'}</div>
          </div>

          <div className="stat-card">
            <div className="label">Plan</div>
            <div className="value">{profile?.plan?.toUpperCase() || 'FREE'}</div>
          </div>

          <div className="stat-card accent">
            <div className="label">Stream Hours</div>
            <div className="value">{profile?.total_stream_hours ? `${Number(profile.total_stream_hours).toFixed(1)}h` : '0h'}</div>
          </div>

          <div className="stat-card">
            <div className="label">Live For</div>
            <div className="value">{profile?.is_live ? liveDuration : '—'}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>
            <i className="fa-solid fa-satellite-dish"></i> Destination Setup
          </h3>
          <span className="subtitle">Real backend configuration only</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card accent">
            <div className="label">Active Destinations</div>
            <div className="value">{activeDestinations}</div>
            <div className="sub">Platforms receiving your stream</div>
          </div>
          <div className="stat-card">
            <div className="label">Stream Key</div>
            <div className="value">{profile?.stream_key ? `${profile.stream_key.slice(0, 6)}…${profile.stream_key.slice(-4)}` : '—'}</div>
            <div className="sub">Keep this private</div>
          </div>
          <div className="stat-card">
            <div className="label">Sessions</div>
            <div className="value">{sessionCount}</div>
            <div className="sub">Stored stream history</div>
          </div>
          <div className="stat-card">
            <div className="label">Last IP</div>
            <div className="value">{profile?.last_ip || '—'}</div>
            <div className="sub">Most recent ingest client</div>
          </div>
          <div className="stat-card">
            <div className="label">Started</div>
            <div className="value">{formatTime(profile?.stream_start_time)}</div>
            <div className="sub">Current or last stream</div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>Configured Platforms</h3>
            <span style={{ fontSize: '.75rem', color: 'var(--dash-muted)' }}>Pulled from the backend</span>
          </div>
          <div className="platform-grid">
            {destinationCards.map((item) => (
              <div className={`platform-tile ${item.enabled ? 'active' : ''}`} key={item.label}>
                <span className="pt-check">{item.enabled ? '✓' : '—'}</span>
                <div className="pt-icon">
                  <img className="platform-logo" src={item.icon} alt={item.label} />
                </div>
                <div className="pt-name">{item.label}</div>
                <div className="pt-status">{item.enabled ? 'ON' : 'OFF'}</div>
                <div className="pt-status" style={{ gridColumn: '1 / -1', fontSize: '11px', lineHeight: 1.4, color: 'var(--dash-muted)' }}>
                  URL: {formatStoredValue(item.url)}
                </div>
                <div className="pt-status" style={{ gridColumn: '1 / -1', fontSize: '11px', lineHeight: 1.4, color: 'var(--dash-muted)' }}>
                  Key: {formatStoredValue(item.url ? item.url.split('/').filter(Boolean).pop() : '')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Sessions</h3></div>
          {recentSessions.length === 0 ? (
            <p style={{ color: 'var(--dash-muted)' }}>No sessions yet. Start a stream to build history.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {recentSessions.map((session) => (
                <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', border: '1px solid var(--dash-border)', borderRadius: '14px', background: 'var(--dash-card2)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{formatTime(session.started_at)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--dash-muted)' }}>{session.ingest_type?.toUpperCase() || 'UNKNOWN'} • {session.client_ip || 'Unknown IP'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{formatDuration(session.duration_seconds)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--dash-muted)' }}>{session.streamed_to || 'No destinations'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3>What to do next</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button type="button" className="btn btn-primary" onClick={() => onNavigateSection?.('ingest')}>
            Go to Stream Keys
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigateSection?.('destinations')}>
            Review Destinations
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigateSection?.('sessions')}>
            Open History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
