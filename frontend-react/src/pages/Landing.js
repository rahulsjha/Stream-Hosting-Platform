import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Initialize canvas background animation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simple animated gradient background
    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.0005;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsl(260, 30%, ${6 + Math.sin(time) * 2}%)`);
      gradient.addColorStop(0.5, `hsl(260, 40%, ${8 + Math.cos(time * 0.7) * 2}%)`);
      gradient.addColorStop(1, `hsl(260, 30%, ${5 + Math.sin(time * 1.3) * 2}%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleCursorMove = (e) => {
    const cursor = document.getElementById('cur');
    const cursorRing = document.getElementById('cur-ring');

    if (cursor) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.style.display = 'block';
    }

    if (cursorRing) {
      cursorRing.style.left = e.clientX + 'px';
      cursorRing.style.top = e.clientY + 'px';
      cursorRing.style.display = 'block';
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleCursorMove);
    return () => document.removeEventListener('mousemove', handleCursorMove);
  }, []);

  return (
    <div className="landing-page">
      <canvas ref={canvasRef} id="hero-canvas"></canvas>

      {/* Overlays */}
      <div className="hero-overlay"></div>
      <div className="scanlines"></div>
      <div className="vignette"></div>

      {/* Navigation */}
      <nav className="landing-nav">
        <a href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <i className="fas fa-tower-broadcast"></i>
          </div>
          <span className="nav-logo-text">SIL</span>
        </a>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="nav-right">
          <button
            className="btn-nav"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          {/* Left side - Content */}
          <div className="hero-left">
            <div className="hero-tag">
              <span className="hero-tag-pulse"></span>
              <span>The Streaming OS</span>
            </div>

            <h1 className="hero-h1">
              <span className="w1">Multi-Destination</span>
              <span className="w2">Stream Manager</span>
              <span className="w3">for IRL</span>
            </h1>

            <p className="hero-p">
              Go live simultaneously to <strong>YouTube, Twitch, and Kick</strong> with one stream.
              Professional quality. Zero setup.
            </p>

            <div className="platform-proof">
              <div className="platform-proof-label">Stream to</div>
              <div className="platform-proof-list">
                <div className="platform-pill youtube">
                  <i className="fab fa-youtube"></i>
                  <span>YOUTUBE</span>
                </div>
                <div className="platform-pill twitch">
                  <i className="fab fa-twitch"></i>
                  <span>TWITCH</span>
                </div>
                <div className="platform-pill kick">
                  <i className="fas fa-bolt"></i>
                  <span>KICK</span>
                </div>
              </div>
            </div>

            <div className="hero-btns">
              <button
                className="btn-primary"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-play"></i>
                Get Started Free
              </button>
              <button
                className="btn-secondary"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-n">15<span className="unit">K+</span></div>
                <div className="stat-l">Streamers</div>
              </div>
              <div className="stat">
                <div className="stat-n">2<span className="unit">M</span></div>
                <div className="stat-l">Hours Streamed</div>
              </div>
              <div className="stat">
                <div className="stat-n">99.9<span className="unit">%</span></div>
                <div className="stat-l">Uptime</div>
              </div>
              <div className="stat">
                <div className="stat-n compact">LIVE</div>
                <div className="stat-l">Now</div>
              </div>
            </div>
          </div>

          {/* Right side - Stream Card */}
          <div className="hero-right">
            <div className="stream-card">
              <div className="stream-screen">
                <canvas id="stream-canvas" style={{ width: '100%', height: '100%', display: 'block' }}></canvas>

                <div className="stream-hud">
                  <div className="hud-top">
                    <div className="hud-live">
                      <span className="hud-live-dot"></span>
                      LIVE
                    </div>
                    <div className="hud-quality">4K 60fps</div>
                    <div className="hud-viewers">👁️ 4.2K</div>
                  </div>

                  <div className="hud-bottom">
                    <div className="chat-msgs">
                      <div className="chat-msg">
                        <span className="chat-user">streamer</span>
                        <span className="chat-text">yo what's up everyone</span>
                      </div>
                      <div className="chat-msg">
                        <span className="chat-user">viewer99</span>
                        <span className="chat-text">let's goooo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stream-bottom">
                <div className="mini-stat">
                  <div className="mini-val r">3.2K</div>
                  <div className="mini-label">bitrate</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-val g">56</div>
                  <div className="mini-label">fps</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-val b">4K</div>
                  <div className="mini-label">resolution</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-val o">12ms</div>
                  <div className="mini-label">latency</div>
                </div>
              </div>

              <div className="stream-actions">
                <button className="act-btn active">
                  <i className="fab fa-youtube"></i> YouTube
                </button>
                <button className="act-btn">
                  <i className="fab fa-twitch"></i> Twitch
                </button>
                <button className="act-btn">
                  <i className="fas fa-bolt"></i> Kick
                </button>
              </div>
            </div>

            {/* Floating badges */}
            <div className="float-badge fb1">
              <div className="fb-icon r">
                <i className="fas fa-bolt"></i>
              </div>
              <div>
                <div className="fb-main">Auto-Failover</div>
                <div className="fb-sub">Network resilient</div>
              </div>
            </div>

            <div className="float-badge fb2">
              <div className="fb-icon g">
                <i className="fas fa-shield"></i>
              </div>
              <div>
                <div className="fb-main">BRB Manager</div>
                <div className="fb-sub">Auto-recovery</div>
              </div>
            </div>

            <div className="float-badge fb3">
              <div className="fb-icon b">
                <i className="fas fa-chart"></i>
              </div>
              <div>
                <div className="fb-main">Real-time Stats</div>
                <div className="fb-sub">Live metrics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker-wrap">
          <div className="ticker-track">
            <span className="ti">MULTI-DESTINATION STREAMING</span>
            <span className="ti-sep">•</span>
            <span className="ti">SRT & RTMP INGEST</span>
            <span className="ti-sep">•</span>
            <span className="ti">AUTO-RESTREAM</span>
            <span className="ti-sep">•</span>
            <span className="ti">HEALTH MONITORING</span>
            <span className="ti-sep">•</span>
            <span className="ti">MULTI-DESTINATION STREAMING</span>
            <span className="ti-sep">•</span>
            <span className="ti">SRT & RTMP INGEST</span>
            <span className="ti-sep">•</span>
            <span className="ti">AUTO-RESTREAM</span>
            <span className="ti-sep">•</span>
            <span className="ti">HEALTH MONITORING</span>
          </div>
        </div>
      </section>

      {/* Custom Cursor */}
      <div id="cur"></div>
      <div id="cur-ring"></div>
    </div>
  );
};

export default Landing;
