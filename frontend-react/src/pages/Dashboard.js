import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/endpoints';
import Overview from '../components/dashboard/Overview';
import Destinations from '../components/dashboard/Destinations';
import IngestKeys from '../components/dashboard/IngestKeys';
import Sessions from '../components/dashboard/Sessions';
import Quality from '../components/dashboard/Quality';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const bgCanvasRef = useRef(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [liveDuration, setLiveDuration] = useState('—');
  const activeDestinationCount = useMemo(() => {
    if (!profile) return 0;
    return [profile.stream_to_youtube, profile.stream_to_twitch, profile.stream_to_kick].filter(Boolean).length;
  }, [profile]);

  const sections = useMemo(
    () => ({
      overview: { label: 'Dashboard', crumb: 'Overview', icon: 'fa-grid-2' },
      destinations: { label: 'Platforms', crumb: 'Connected Platforms', icon: 'fa-satellite-dish' },
      ingest: { label: 'Stream Keys', crumb: 'Key Management', icon: 'fa-key' },
      sessions: { label: 'Previous Streams', crumb: 'Stream History', icon: 'fa-chart-simple' },
      quality: { label: 'Settings', crumb: 'Configuration', icon: 'fa-sliders' },
    }),
    []
  );

  useEffect(() => {
    let alive = true;

    const loadUserData = async () => {
      if (!user?.username) {
        if (alive) {
          setProfile(user || null);
          setSessionCount(0);
          setLoading(false);
        }
        return;
      }

      setProfile(user);

      try {
        const sessionsResponse = await userAPI.getSessions(user.username);
        if (!alive) return;
        setSessionCount(Array.isArray(sessionsResponse.data) ? sessionsResponse.data.length : 0);
      } catch {
        if (alive) setSessionCount(0);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadUserData();

    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    let timerId;

    const updateLiveDuration = () => {
      if (!profile?.is_live || !profile?.stream_start_time) {
        setLiveDuration('—');
        return;
      }

      const startTime = new Date(profile.stream_start_time).getTime();
      if (Number.isNaN(startTime)) {
        setLiveDuration('—');
        return;
      }

      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      setLiveDuration(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateLiveDuration();
    if (profile?.is_live) {
      timerId = window.setInterval(updateLiveDuration, 1000);
    }

    return () => {
      if (timerId) window.clearInterval(timerId);
    };
  }, [profile]);

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
        return <Overview profile={profile} sessionCount={sessionCount} liveDuration={liveDuration} onNavigateSection={setActiveSection} />;
      case 'destinations':
        return <Destinations />;
      case 'ingest':
        return <IngestKeys />;
      case 'sessions':
        return <Sessions />;
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
        <div className="sidebar-status">
          <span className="status-dot" />
          <span className="status-text">{profile?.is_live ? 'LIVE' : 'OFFLINE'}</span>
          <span className="status-count">{sessionCount}</span>
        </div>

        <div className="nav-section">
          <div className="nav-section-label">Main</div>
          {['overview', 'destinations', 'ingest', 'sessions', 'quality'].map((section) => (
            <button
              key={section}
              className={`nav-item ${activeSection === section ? 'active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              <i className={`fa-solid ${sections[section].icon} nav-icon`} />
              <span>{sections[section].label}</span>
              {section === 'destinations' && <span className="nav-badge green">{activeDestinationCount}</span>}
              {section === 'sessions' && <span className="nav-badge cyan">{sessionCount}</span>}
            </button>
          ))}
        </div>

        <div className="nav-section nav-section-platforms">
          <div className="nav-section-label">Active Platforms</div>
          <div className="platform-chips">
            {[
              ['YouTube', profile?.stream_to_youtube, '#ff0000'],
              ['Twitch', profile?.stream_to_twitch, '#9146ff'],
              ['Kick', profile?.stream_to_kick, '#53fc18'],
            ].map(([name, enabled, color]) => (
              <div className="platform-chip" key={name}>
                <span className="platform-chip-dot" style={{ background: enabled ? color : 'transparent', border: enabled ? 'none' : '1px solid rgba(255,255,255,0.06)' }} />
                <span className="platform-chip-name">{name}</span>
                <span className={`platform-chip-state ${enabled ? 'live' : 'off'}`}>
                  {enabled ? <span className="live-dot-inline" style={{ color }} /> : null}
                  {enabled ? 'Connected' : 'Off'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{(user?.username || 'R').slice(0, 1).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.username || profile?.username || 'Your Account'}</div>
            <div className="user-plan">{(user?.plan || profile?.plan || 'free').toUpperCase()} PLAN</div>
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
            <div className="topbar-breadcrumb"><span>{sections[activeSection]?.crumb || 'Overview'}</span></div>
          </div>
        </header>

        <div className="dashboard-page">
          {activeSection === 'overview' ? (
            renderSection()
          ) : (
            <div className="section-shell">
              <div className="section-hd">
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
