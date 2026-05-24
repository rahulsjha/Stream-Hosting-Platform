import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Destinations from '../components/dashboard/Destinations';
import IngestKeys from '../components/dashboard/IngestKeys';
import Sessions from '../components/dashboard/Sessions';
import BRBHealth from '../components/dashboard/BRBHealth';
import Quality from '../components/dashboard/Quality';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, fetchProfile } = useAuth();
  const bgCanvasRef = useRef(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState('24.3K');
  const [liveDuration, setLiveDuration] = useState('2:14:37');

  const sections = useMemo(
    () => ({
      overview: { label: 'Dashboard', crumb: 'Overview', icon: 'fa-grid-2' },
      destinations: { label: 'Platforms', crumb: 'Connected Platforms', icon: 'fa-satellite-dish' },
      ingest: { label: 'Stream Keys', crumb: 'Key Management', icon: 'fa-key' },
      sessions: { label: 'Previous Streams', crumb: 'Stream History', icon: 'fa-chart-simple' },
      'anti-scuff': { label: 'BRB / Health', crumb: 'Stream Health', icon: 'fa-shield-halved' },
      quality: { label: 'Settings', crumb: 'Configuration', icon: 'fa-sliders' },
    }),
    []
  );

  const loadUserData = useCallback(async () => {
    try {
      await fetchProfile();
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const liveTicker = setInterval(() => {
      const offset = (Math.random() * 0.6 - 0.3).toFixed(1);
      setViewerCount(`${(24 + Number(offset)).toFixed(1)}K`);
    }, 4000);

    let elapsedSeconds = 2 * 3600 + 14 * 60 + 37;
    const durationTicker = setInterval(() => {
      elapsedSeconds += 1;
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      setLiveDuration(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => {
      clearInterval(liveTicker);
      clearInterval(durationTicker);
    };
  }, []);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let particles = [];

    const initParticles = () => {
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 0.2,
        alpha: Math.random() * 0.25 + 0.05,
        color: ['255,23,68', '124,58,237', '6,182,212', '255,255,255'][Math.floor(Math.random() * 4)],
      }));
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        particles.slice(index + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            context.beginPath();
            context.strokeStyle = `rgba(124,58,237,${0.04 * (1 - distance / 120)})`;
            context.lineWidth = 0.5;
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        });

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particle.color},${particle.alpha})`;
        context.fill();
      });

      animationFrameId = window.requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-orb" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="dashboard-overview">
            <div className="live-status-bar">
              <div className="live-badge">
                <span className="live-badge-dot" />
                LIVE
              </div>

              <div className="live-info">
                <div className="live-info-item">
                  <div className="live-info-val live-info-red" id="dash-viewers">{viewerCount}</div>
                  <div className="live-info-lbl">Viewers</div>
                </div>
                <div className="live-info-item">
                  <div className="live-info-val live-info-cyan">{liveDuration}</div>
                  <div className="live-info-lbl">Duration</div>
                </div>
                <div className="live-info-item">
                  <div className="live-info-val live-info-green">6,000</div>
                  <div className="live-info-lbl">Bitrate kbps</div>
                </div>
                <div className="live-info-item">
                  <div className="live-info-val live-info-gold">1080p60</div>
                  <div className="live-info-lbl">Quality</div>
                </div>
              </div>

              <div className="live-platforms">
                <div className="live-platform-dot youtube">
                  <span className="dot" /> YouTube
                </div>
                <div className="live-platform-dot twitch">
                  <span className="dot" /> Twitch
                </div>
                <div className="live-platform-dot kick">
                  <span className="dot" /> Kick
                </div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card red">
                <div className="stat-card-label">Peak Viewers Today</div>
                <div className="stat-card-val red">32.1K</div>
                <div className="stat-card-sub"><span className="stat-delta">↑ 12.4%</span> vs last stream</div>
              </div>
              <div className="stat-card violet">
                <div className="stat-card-label">New Followers</div>
                <div className="stat-card-val violet">+847</div>
                <div className="stat-card-sub"><span className="stat-delta">↑ 8.2%</span> this week</div>
              </div>
              <div className="stat-card cyan">
                <div className="stat-card-label">Revenue (MTD)</div>
                <div className="stat-card-val cyan">$2.4K</div>
                <div className="stat-card-sub"><span className="stat-delta">↑ 31%</span> vs last month</div>
              </div>
              <div className="stat-card green">
                <div className="stat-card-label">Avg Watch Time</div>
                <div className="stat-card-val green">48m</div>
                <div className="stat-card-sub"><span className="stat-delta neg">↓ 3.1%</span> vs avg</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card glass-card">
                <div className="card-title">
                  <i className="fa-solid fa-chart-line" /> Viewer Analytics
                </div>
                <div className="card-sub">Last 7 days - all platforms combined</div>
                <div className="chart-wrap">
                  <div className="chart-grid" />
                  <div className="chart-plot">
                    {[28, 44, 35, 58, 72, 64, 86].map((heightValue, index) => (
                      <div className="chart-bar-group" key={index}>
                        <div className="chart-bar" style={{ height: `${heightValue}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-labels">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                    <span className="chart-label" key={label}>{label}</span>
                  ))}
                </div>
              </div>

              <div className="card glass-card">
                <div className="card-title">
                  <i className="fa-solid fa-circle-nodes" /> Platform Breakdown
                </div>
                <div className="card-sub">Viewer share by platform - live session</div>

                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <div className="breakdown-head">
                      <span className="breakdown-label youtube"><span className="breakdown-dot youtube" />YouTube</span>
                      <span className="breakdown-value">14.2K <strong>58%</strong></span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill red" style={{ width: '58%' }} /></div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-head">
                      <span className="breakdown-label twitch"><span className="breakdown-dot twitch" />Twitch</span>
                      <span className="breakdown-value">7.1K <strong>29%</strong></span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill violet" style={{ width: '29%' }} /></div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-head">
                      <span className="breakdown-label kick"><span className="breakdown-dot kick" />Kick</span>
                      <span className="breakdown-value">3.0K <strong>13%</strong></span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill green" style={{ width: '13%' }} /></div>
                  </div>
                </div>

                <div className="divider" />
                <div className="card-sub">Stream Health</div>
                <div className="health-grid">
                  <div className="health-item">
                    <div className="health-value green">99.8<span>%</span></div>
                    <div className="health-label">Uptime</div>
                  </div>
                  <div className="health-item">
                    <div className="health-value cyan">8<span>ms</span></div>
                    <div className="health-label">Latency</div>
                  </div>
                  <div className="health-item">
                    <div className="health-value gold">0.2<span>%</span></div>
                    <div className="health-label">Drop Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card glass-card">
                <div className="card-title">Recent Activity</div>
                <div className="card-sub">Live events from your stream</div>

                {[
                  ['🎯', 'New milestone - 30K viewers', 'Peak reached on YouTube', '2m ago', 'rose'],
                  ['💚', 'xgamer99 subscribed', 'Twitch - 6-month streak', '4m ago', 'green'],
                  ['💰', 'nova_fan donated $20', 'YouTube Super Chat', '8m ago', 'gold'],
                  ['🔗', 'Kick stream connected', 'Secondary output active', '14m ago', 'violet'],
                  ['📡', 'Stream started', 'Multi-platform broadcast initiated', '2h ago', 'cyan'],
                ].map(([icon, title, subtitle, time, tone]) => (
                  <div className="feed-item" key={title}>
                    <div className={`feed-icon ${tone}`}>{icon}</div>
                    <div className="feed-body">
                      <div className="feed-title">{title}</div>
                      <div className="feed-sub">{subtitle}</div>
                    </div>
                    <div className="feed-time">{time}</div>
                  </div>
                ))}
              </div>

              <div className="card glass-card">
                <div className="card-title">Quick Actions</div>
                <div className="card-sub">Manage your stream fast</div>
                <div className="quick-actions">
                  <button className="topbar-btn primary action-cta" onClick={() => setActiveSection('ingest')}>
                    <i className="fa-solid fa-circle-play" /> Start Stream Session
                  </button>

                  <div className="quick-actions-grid">
                    <button className="topbar-btn action-tile" onClick={() => setActiveSection('destinations')}>
                      <i className="fa-solid fa-circle-nodes action-icon violet" />
                      <span>Platforms</span>
                    </button>
                    <button className="topbar-btn action-tile" onClick={() => setActiveSection('ingest')}>
                      <i className="fa-solid fa-key action-icon cyan" />
                      <span>Stream Keys</span>
                    </button>
                    <button className="topbar-btn action-tile" onClick={() => setActiveSection('sessions')}>
                      <i className="fa-solid fa-film action-icon gold" />
                      <span>Past Streams</span>
                    </button>
                    <button className="topbar-btn action-tile" onClick={() => setActiveSection('quality')}>
                      <i className="fa-solid fa-sliders action-icon green" />
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className="warning-box">
                    <i className="fa-solid fa-triangle-exclamation warning-icon" />
                    <div>
                      <div className="warning-title">Bitrate Warning</div>
                      <div className="warning-sub">Twitch bitrate dropped to 4200 kbps</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'destinations':
        return <Destinations />;
      case 'ingest':
        return <IngestKeys />;
      case 'sessions':
        return <Sessions />;
      case 'anti-scuff':
        return <BRBHealth />;
      case 'quality':
        return <Quality />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-shell">
      <canvas ref={bgCanvasRef} className="dashboard-bg" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      <aside className="dashboard-sidebar">
        <a className="sidebar-logo" href="/" aria-label="Second Chat home">
          <div className="sidebar-logo-mark">
            <i className="fa-solid fa-tower-broadcast" />
          </div>
          <div className="sidebar-logo-copy">
            <span className="sidebar-logo-title">Second Chat</span>
            <span className="sidebar-logo-subtitle">Dashboard</span>
          </div>
        </a>

        <div className="sidebar-status">
          <span className="status-dot" />
          <span className="status-text">LIVE NOW</span>
          <span className="status-count">{viewerCount}</span>
        </div>

        <div className="nav-section">
          <div className="nav-section-label">Main</div>
          {['overview', 'destinations', 'ingest', 'sessions', 'anti-scuff', 'quality'].map((section) => (
            <button
              key={section}
              className={`nav-item ${activeSection === section ? 'active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              <i className={`fa-solid ${sections[section].icon} nav-icon`} />
              <span>{sections[section].label}</span>
              {section === 'destinations' && <span className="nav-badge green">3</span>}
              {section === 'sessions' && <span className="nav-badge cyan">18</span>}
            </button>
          ))}
        </div>

        <div className="nav-section nav-section-platforms">
          <div className="nav-section-label">Active Platforms</div>
          <div className="platform-chips">
            {[
              ['YouTube', '#ff0000', 'LIVE'],
              ['Twitch', '#9146ff', 'LIVE'],
              ['Facebook', '#1877f2', 'Idle'],
              ['Kick', '#53fc18', 'LIVE'],
              ['TikTok', '#fe2c55', 'Not Connected'],
            ].map(([name, color, state]) => (
              <div className="platform-chip" key={name}>
                <span className="platform-chip-dot" style={{ background: color }} />
                <span className="platform-chip-name">{name}</span>
                <span className={`platform-chip-state ${state === 'LIVE' ? 'live' : state === 'Idle' ? 'idle' : 'off'}`}>
                  {state === 'LIVE' && <span className="live-dot-inline" />}
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{(user?.username || 'R').slice(0, 1).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'nova_plays'}</div>
            <div className="user-plan">{(user?.plan || 'pro').toUpperCase()} PLAN</div>
          </div>
          <button className="user-logout" onClick={handleLogout} aria-label="Sign out">
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{sections[activeSection]?.label || 'Dashboard'}</div>
            <div className="topbar-breadcrumb">Second Chat / <span>{sections[activeSection]?.crumb || 'Overview'}</span></div>
          </div>

          <div className="topbar-actions">
            <button className="topbar-btn" onClick={() => setActiveSection('ingest')}>
              <i className="fa-solid fa-key" /> Stream Key
            </button>
            <button className="notif-btn" type="button" aria-label="Notifications">
              <span className="notif-pip" />
              <i className="fa-regular fa-bell" />
            </button>
            <button className="topbar-btn primary" onClick={() => setActiveSection('ingest')}>
              <i className="fa-solid fa-circle-play" /> GO LIVE
            </button>
          </div>
        </header>

        <div className="dashboard-page">
          {activeSection === 'overview' ? (
            renderSection()
          ) : (
            <div className="section-shell">
              <div className="section-hd">
                <div>
                  <h2>{sections[activeSection]?.label || 'Dashboard'}</h2>
                  <p>{sections[activeSection]?.crumb || 'Configuration'}</p>
                </div>
                <button className="topbar-btn primary" onClick={() => setActiveSection('overview')}>
                  <i className="fa-solid fa-house" /> Back to overview
                </button>
              </div>

              <div className="section-card-wrap">
                {renderSection()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
