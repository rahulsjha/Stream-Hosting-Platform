import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Overview from '../components/dashboard/Overview';
import Destinations from '../components/dashboard/Destinations';
import IngestKeys from '../components/dashboard/IngestKeys';
import Sessions from '../components/dashboard/Sessions';
import BRBHealth from '../components/dashboard/BRBHealth';
import Quality from '../components/dashboard/Quality';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, fetchProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user profile on mount
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      await fetchProfile();
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const sections = {
    overview: { label: 'Overview', icon: 'fa-signal' },
    destinations: { label: 'Stream Destinations', icon: 'fa-satellite-dish' },
    ingest: { label: 'Ingest Keys', icon: 'fa-key' },
    sessions: { label: 'Session History', icon: 'fa-chart-simple' },
    'anti-scuff': { label: 'BRB / Stream Health', icon: 'fa-shield-halved' },
    quality: { label: 'Stream Quality', icon: 'fa-sliders' },
  };

  return (
    <div className="page-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <i className="fa-solid fa-tower-broadcast"></i> SIL <span>Hosting</span>
        </div>

        <div className="nav-section">
          <div className="nav-label">Streaming</div>
          {['overview', 'destinations', 'ingest'].map((section) => (
            <button
              key={section}
              className={`nav-item ${activeSection === section ? 'active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              <i className={`fa-solid ${sections[section].icon} icon`}></i>
              {sections[section].label}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-label">History</div>
          <button
            className={`nav-item ${activeSection === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveSection('sessions')}
          >
            <i className="fa-solid fa-chart-simple icon"></i>
            Session History
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-label">Anti-Scuff</div>
          <button
            className={`nav-item ${activeSection === 'anti-scuff' ? 'active' : ''}`}
            onClick={() => setActiveSection('anti-scuff')}
          >
            <i className="fa-solid fa-shield-halved icon"></i>
            BRB / Health
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-label">Quality</div>
          <button
            className={`nav-item ${activeSection === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveSection('quality')}
          >
            <i className="fa-solid fa-sliders icon"></i>
            Stream Quality
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="ws-indicator">
            <span className="ws-dot" id="wsIndicator"></span>
            <span id="wsStatus">Connected</span>
          </div>
          <button className="nav-item" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket icon"></i>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <div className="page-header">
          <div>
            <h1 id="pageTitle">{sections[activeSection]?.label || 'Dashboard'}</h1>
            <div className="page-subtitle">
              Logged in as <strong>{user?.username}</strong>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary btn-sm">
              <i className="fa-solid fa-rotate-right"></i> Refresh
            </button>
          </div>
        </div>

        {/* Section Content */}
        <div className="section-container">
          {activeSection === 'overview' && <Overview userData={userData} />}
          {activeSection === 'destinations' && <Destinations />}
          {activeSection === 'ingest' && <IngestKeys />}
          {activeSection === 'sessions' && <Sessions />}
          {activeSection === 'anti-scuff' && <BRBHealth />}
          {activeSection === 'quality' && <Quality />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
