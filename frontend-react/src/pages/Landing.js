import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const canvasRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const ctaCanvasRef = useRef(null);

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

  useEffect(() => {
    const waveCanvas = waveCanvasRef.current;
    const ctaCanvas = ctaCanvasRef.current;
    const waveCtx = waveCanvas?.getContext('2d');
    const ctaCtx = ctaCanvas?.getContext('2d');

    if (!waveCanvas || !waveCtx || !ctaCanvas || !ctaCtx) return;

    let animationId;
    let startTime = 0;

    const resizeCanvases = () => {
      const waveRect = waveCanvas.parentElement?.getBoundingClientRect();
      waveCanvas.width = Math.max(1, Math.floor(waveRect?.width || window.innerWidth));
      waveCanvas.height = Math.max(1, Math.floor(waveRect?.height || 200));

      const ctaRect = ctaCanvas.parentElement?.getBoundingClientRect();
      ctaCanvas.width = Math.max(1, Math.floor(ctaRect?.width || window.innerWidth));
      ctaCanvas.height = Math.max(1, Math.floor(ctaRect?.height || 520));
    };

    const drawWave = (ctx, width, height, t, amplitude, frequency, speed, color, alpha, offsetY) => {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const y = height * offsetY + Math.sin((x * frequency) + (t * speed)) * amplitude + Math.sin((x * frequency * 0.4) + (t * speed * 1.3)) * (amplitude * 0.35);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = color;
      ctx.stroke();
    };

    const drawAnimatedWaveSection = (time) => {
      const t = (time - startTime) / 1000;
      const width = waveCanvas.width;
      const height = waveCanvas.height;

      waveCtx.clearRect(0, 0, width, height);
      const background = waveCtx.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, '#020208');
      background.addColorStop(0.5, '#04040c');
      background.addColorStop(1, '#020208');
      waveCtx.fillStyle = background;
      waveCtx.fillRect(0, 0, width, height);

      waveCtx.save();
      waveCtx.globalCompositeOperation = 'lighter';
      drawWave(waveCtx, width, height, t, 18, 0.016, 1.0, '#ff1744', 0.9, 0.44);
      drawWave(waveCtx, width, height, t, 14, 0.019, 1.35, '#7c3aed', 0.8, 0.5);
      drawWave(waveCtx, width, height, t, 16, 0.017, 1.15, '#06b6d4', 0.75, 0.38);
      waveCtx.restore();
    };

    const drawCtaBackdrop = (time) => {
      const t = (time - startTime) / 1000;
      const width = ctaCanvas.width;
      const height = ctaCanvas.height;

      ctaCtx.clearRect(0, 0, width, height);
      const background = ctaCtx.createRadialGradient(width * 0.5, height * 0.5, 40, width * 0.5, height * 0.5, Math.max(width, height) * 0.55);
      background.addColorStop(0, 'rgba(255, 23, 68, 0.15)');
      background.addColorStop(0.45, 'rgba(124, 58, 237, 0.08)');
      background.addColorStop(1, 'rgba(2, 2, 8, 0)');
      ctaCtx.fillStyle = background;
      ctaCtx.fillRect(0, 0, width, height);

      ctaCtx.save();
      ctaCtx.globalAlpha = 0.28;
      ctaCtx.strokeStyle = '#06b6d4';
      ctaCtx.lineWidth = 1;
      for (let i = 0; i < 28; i += 1) {
        const x = (width / 28) * i;
        const dashOffset = (t * 120 + i * 12) % 180;
        ctaCtx.setLineDash([2, 18]);
        ctaCtx.lineDashOffset = dashOffset;
        ctaCtx.beginPath();
        ctaCtx.moveTo(x, 0);
        ctaCtx.lineTo(x, height);
        ctaCtx.stroke();
      }
      ctaCtx.restore();
    };

    const animate = (time) => {
      if (!startTime) startTime = time;
      drawAnimatedWaveSection(time);
      drawCtaBackdrop(time);
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    animate(performance.now());

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvases);
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

  const handlePlanSelect = (plan) => {
    navigate(`/login?plan=${encodeURIComponent(plan)}`);
  };

  // Waitlist form state
  const [waitEmail, setWaitEmail] = useState('');
  const [waitPlatform, setWaitPlatform] = useState('Twitch');
  const [waitChannel, setWaitChannel] = useState('Gaming');
  const [waitCount, setWaitCount] = useState(null);
  const [submittingWaitlist, setSubmittingWaitlist] = useState(false);
  const [waitMsg, setWaitMsg] = useState('');

  useEffect(() => {
    // fetch current waitlist count
    let cancelled = false;
    fetch('/api/waitlist/count')
      .then(r => r.json())
      .then(j => {
        if (!cancelled && j && typeof j.count !== 'undefined') setWaitCount(j.count);
      })
      .catch(() => {
        if (!cancelled) setWaitCount(null);
      });
    return () => { cancelled = true; };
  }, []);

  const submitWaitlist = async (e) => {
    e?.preventDefault();
    if (!waitEmail) { setWaitMsg('Please enter an email'); return; }
    setSubmittingWaitlist(true);
    setWaitMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitEmail, platform: waitPlatform, channel_type: waitChannel })
      });
      if (!res.ok) throw new Error('Network error');
      setWaitMsg('Thanks — you are on the waitlist');
      setWaitEmail('');
      // refresh count
      const r2 = await fetch('/api/waitlist/count');
      const j2 = await r2.json();
      if (j2 && typeof j2.count !== 'undefined') setWaitCount(j2.count);
    } catch (err) {
      setWaitMsg('Unable to add to waitlist — try again later');
    } finally {
      setSubmittingWaitlist(false);
    }
  };

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
          <img src="/assets/logo.png" alt="Second Chat" className="nav-logo-img" />
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

      {/* Features */}
      <section className="features" id="features">
        <div className="r in">
          <div className="sec-label">Platform Engine</div>
          <h2 className="sec-h2">BUILT FOR <em>PERFORMANCE</em></h2>
          <p className="sec-p">Everything you need to broadcast, monetize, and grow your audience in a single unified operating system designed exclusively for top-tier creators.</p>
        </div>

        <div className="feat-grid">
          <div className="feat-card r in" data-delay="1" style={{ '--ca': 'var(--red)', '--ci': 'rgba(255,23,68,.08)', '--cb': 'rgba(255,23,68,.18)', '--cg': 'rgba(255,23,68,.15)' }}>
            <div className="feat-num">01</div>
            <div className="feat-icon-wrap"><i className="fas fa-bolt"></i></div>
            <div className="feat-title">GLOBAL EDGE NETWORK</div>
            <div className="feat-desc">Route your stream through our decentralized edge servers guaranteeing sub-80ms latency for viewers anywhere in the world.</div>
          </div>
          <div className="feat-card r in" data-delay="2" style={{ '--ca': 'var(--violet2)', '--ci': 'rgba(168,85,247,.08)', '--cb': 'rgba(168,85,247,.18)', '--cg': 'rgba(168,85,247,.15)' }}>
            <div className="feat-num">02</div>
            <div className="feat-icon-wrap"><i className="fas fa-desktop"></i></div>
            <div className="feat-title">MULTI-PLATFORM SIMULCAST</div>
            <div className="feat-desc">Broadcast to Twitch, YouTube, Kick, and TikTok simultaneously without CPU overhead or third-party plugins.</div>
          </div>
          <div className="feat-card r in" data-delay="3" style={{ '--ca': 'var(--cyan)', '--ci': 'rgba(6,182,212,.08)', '--cb': 'rgba(6,182,212,.18)', '--cg': 'rgba(6,182,212,.15)' }}>
            <div className="feat-num">03</div>
            <div className="feat-icon-wrap"><i className="fas fa-comment-dots"></i></div>
            <div className="feat-title">UNIFIED SMART CHAT</div>
            <div className="feat-desc">Aggregate messages from all platforms into one interface with AI moderation, highlight filtering, and live translation.</div>
          </div>
          <div className="feat-card r in" data-delay="1" style={{ '--ca': 'var(--gold)', '--ci': 'rgba(245,158,11,.08)', '--cb': 'rgba(245,158,11,.18)', '--cg': 'rgba(245,158,11,.15)' }}>
            <div className="feat-num">04</div>
            <div className="feat-icon-wrap"><i className="fas fa-dollar-sign"></i></div>
            <div className="feat-title">ADVANCED MONETIZATION</div>
            <div className="feat-desc">Tipping, memberships, and automated sponsor overlays with 0% platform fees taken from your hard-earned revenue.</div>
          </div>
          <div className="feat-card r in" data-delay="2" style={{ '--ca': 'var(--green)', '--ci': 'rgba(16,185,129,.08)', '--cb': 'rgba(16,185,129,.18)', '--cg': 'rgba(16,185,129,.15)' }}>
            <div className="feat-num">05</div>
            <div className="feat-icon-wrap"><i className="fas fa-wave-square"></i></div>
            <div className="feat-title">REAL-TIME TELEMETRY</div>
            <div className="feat-desc">Track retention graphs, audience demographics, and engagement spikes to understand exactly what content resonates.</div>
          </div>
          <div className="feat-card r in" data-delay="3" style={{ '--ca': 'var(--text)', '--ci': 'rgba(255,255,255,.05)', '--cb': 'rgba(255,255,255,.12)', '--cg': 'rgba(255,255,255,.08)' }}>
            <div className="feat-num">06</div>
            <div className="feat-icon-wrap"><i className="far fa-circle-play"></i></div>
            <div className="feat-title">AUTO-CLIPPING AI</div>
            <div className="feat-desc">Neural engine listens for hype moments to automatically generate ready-to-post Shorts and Reels from your broadcast.</div>
          </div>
        </div>
      </section>

      <div className="waveform-section">
        <canvas id="wave-canvas" ref={waveCanvasRef}></canvas>
        <div className="wave-overlay"></div>
      </div>

      {/* Showcase */}
      <section className="showcase" id="analytics">
        <div className="showcase-inner">
          <div className="r in">
            <div className="sec-label">Command Center</div>
            <h2 className="sec-h2">ACTIONABLE DATA,<br /><em>ZERO CLUTTER.</em></h2>
            <p className="sec-p" style={{ marginBottom: '32px' }}>Manage your entire streaming ecosystem from a sleek native dashboard that consumes virtually zero system resources.</p>
            <ul className="showcase-list">
              <li><span>✓</span> Full OBS &amp; XSplit Integration</li>
              <li><span>✓</span> Cloud-Synced Scene Collections</li>
              <li><span>✓</span> Hardware-Accelerated Encoding</li>
            </ul>
          </div>
          <div className="dashboard-mock r in" data-delay="2">
            <div className="db-header">
              <div className="db-dots"><div className="db-dot"></div><div className="db-dot"></div><div className="db-dot"></div></div>
              <div className="db-title">streamforge — dashboard.app</div>
              <div style={{ width: '40px' }}></div>
            </div>
            <div className="db-body">
              <div className="db-stats-row">
                <div className="db-stat"><div className="db-sv" style={{ color: 'var(--cyan)' }}>8.2M</div><div className="db-sl">Impressions</div></div>
                <div className="db-stat"><div className="db-sv" style={{ color: 'var(--green)' }}>142K</div><div className="db-sl">New Followers</div></div>
                <div className="db-stat"><div className="db-sv" style={{ color: 'var(--gold)' }}>$12.4K</div><div className="db-sl">Sub Revenue</div></div>
                <div className="db-stat"><div className="db-sv" style={{ color: 'var(--red)' }}>18.5%</div><div className="db-sl">Conv. Rate</div></div>
              </div>
              <div className="db-chart-area"><canvas id="mockChart"></canvas></div>
              <div className="db-alerts">
                <div className="db-alert"><div className="db-alert-dot" style={{ background: 'var(--red)' }}></div><div><strong>System Event:</strong> Server US-East high load. Switching to US-Central automatically.</div></div>
                <div className="db-alert"><div className="db-alert-dot" style={{ background: 'var(--green)' }}></div><div><strong>Milestone:</strong> You just crossed 100,000 concurrent viewers. Incredible!</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <div className="pricing-header r in">
            <div className="sec-label" style={{ justifyContent: 'center' }}>Simple Pricing</div>
            <h2 className="sec-h2">SCALE WITHOUT <em>LIMITS.</em></h2>
          </div>
          <div className="pricing-grid">
            <div className="p-card r in" data-delay="1" role="button" tabIndex={0} onClick={() => handlePlanSelect('creator')} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handlePlanSelect('creator')}>
              <div className="p-name">Creator</div>
              <div className="p-price"><sup>$</sup>0</div>
              <div className="p-period">forever free</div>
              <div className="p-div"></div>
              <div className="p-feat"><div className="ck">✓</div> 1080p 60fps Streaming</div>
              <div className="p-feat"><div className="ck">✓</div> Simulcast to 2 platforms</div>
              <div className="p-feat"><div className="ck">✓</div> Basic Chat Aggregation</div>
              <div className="p-feat off"><div className="ck">×</div> AI Auto-Clipping</div>
              <div className="p-feat off"><div className="ck">×</div> Priority Support</div>
                <button className="p-btn" type="button" onClick={() => handlePlanSelect('creator')}>Start Free</button>
            </div>
              <div className="p-card hot r in" data-delay="2" role="button" tabIndex={0} onClick={() => handlePlanSelect('partner')} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handlePlanSelect('partner')}>
              <div className="p-badge">MOST POPULAR</div>
              <div className="p-name" style={{ color: 'var(--red)' }}>Partner</div>
              <div className="p-price"><sup>$</sup>19</div>
              <div className="p-period">per month, billed annually</div>
              <div className="p-div"></div>
              <div className="p-feat"><div className="ck">✓</div> 4K 60fps Streaming</div>
              <div className="p-feat"><div className="ck">✓</div> Unlimited Simulcasting</div>
              <div className="p-feat"><div className="ck">✓</div> Advanced AI Moderation</div>
              <div className="p-feat"><div className="ck">✓</div> AI Auto-Clipping Engine</div>
              <div className="p-feat"><div className="ck">✓</div> 0% Monetization Fees</div>
                <button className="p-btn hot" type="button" onClick={() => handlePlanSelect('partner')}>Get Partner</button>
            </div>
              <div className="p-card r in" data-delay="3" role="button" tabIndex={0} onClick={() => handlePlanSelect('agency')} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handlePlanSelect('agency')}>
              <div className="p-name">Agency</div>
              <div className="p-price"><sup>$</sup>89</div>
              <div className="p-period">per month, billed annually</div>
              <div className="p-div"></div>
              <div className="p-feat"><div className="ck">✓</div> Everything in Partner</div>
              <div className="p-feat"><div className="ck">✓</div> Manage up to 10 Creators</div>
              <div className="p-feat"><div className="ck">✓</div> Custom RTMP Ingests</div>
              <div className="p-feat"><div className="ck">✓</div> Sponsor ROI Dashboards</div>
              <div className="p-feat"><div className="ck">✓</div> 24/7 Priority Support</div>
                <button className="p-btn" type="button" onClick={() => handlePlanSelect('agency')}>Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="proof">
        <div className="r in" style={{ textAlign: 'center' }}>
          <div className="sec-label" style={{ justifyContent: 'center' }}>Wall of Love</div>
          <h2 className="sec-h2">TRUSTED BY <em>PROFESSIONALS</em></h2>
        </div>
        <div className="proof-grid">
          <div className="t-card r in" data-delay="1" style={{ '--tc1': 'var(--violet)', '--tc2': 'var(--cyan)' }}>
            <div className="t-badge part"><div className="t-badge-dot"></div>Second Chat Partner</div>
            <p className="t-quote">"Switching to Second Chat dropped my CPU usage by 40% while pushing higher quality video to both Twitch and YouTube simultaneously. It's <strong>black magic.</strong>"</p>
            <div className="t-author"><div className="t-avatar" style={{ color: 'var(--violet2)' }}>V</div><div><div className="t-name">ValkyrieLive</div><div className="t-handle">3.2M Followers</div></div></div>
          </div>
          <div className="t-card r in" data-delay="2" style={{ '--tc1': 'var(--red)', '--tc2': 'var(--gold)' }}>
            <div className="t-badge live"><div className="t-badge-dot"></div>Live Full-Time</div>
            <p className="t-quote">"The AI clipping tool saves me 15 hours a week. Second Chat has already cut and uploaded my best plays to TikTok before I've even ended the stream. <strong>Unreal.</strong>"</p>
            <div className="t-author"><div className="t-avatar" style={{ color: 'var(--red)' }}>X</div><div><div className="t-name">xGamer99</div><div className="t-handle">1.1M Followers</div></div></div>
          </div>
          <div className="t-card r in" data-delay="3" style={{ '--tc1': 'var(--green)', '--tc2': 'var(--cyan)' }}>
            <div className="t-badge feat"><div className="t-badge-dot"></div>Agency Rep</div>
            <p className="t-quote">"We manage 20+ esports athletes. One centralized dashboard for analytics, stream health, and sponsorships has completely <strong>revolutionized our workflow.</strong>"</p>
            <div className="t-author"><div className="t-avatar" style={{ color: 'var(--green)' }}>N</div><div><div className="t-name">Nexus Talent</div><div className="t-handle">Esports Management</div></div></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section r in" id="waitlist">
        <canvas id="cta-canvas" ref={ctaCanvasRef}></canvas>
        <div className="cta-border"></div>
        <div className="cta-content waitlist-grid">
          <div className="waitlist-copy">
            <div className="waitlist-kicker">Early Access Queue</div>
            <h2 className="cta-h2"><div className="ln1">JOIN THE</div><div className="ln2">WAITLIST</div></h2>
            <div className="cta-sub">Second Chat is opening private access in waves for creators who want Twitch, Kick, and YouTube unified in one fast control center.</div>
            <div className="waitlist-total">{waitCount !== null ? waitCount.toLocaleString() : '—'}<span> creators queued</span></div>
            <div className="waitlist-caption">Founding creators get faster onboarding, migration help, and priority platform rollouts.</div>
            <div className="waitlist-meta">
              <div className="waitlist-pill"><span className="waitlist-dot"></span>Invite waves every Friday</div>
              <div className="waitlist-pill">Unified chat, alerts, and routing</div>
            </div>
          </div>
          <div className="waitlist-card">
            <div className="waitlist-card-title">Get Early Access</div>
            <div className="waitlist-card-copy">Drop your email and primary platform. We’ll hold your spot and send your invite wave when your batch opens.</div>
            <div className="waitlist-form">
              <form onSubmit={submitWaitlist}>
                <div>
                  <label className="waitlist-label">Email Address</label>
                  <input className="waitlist-field" type="email" placeholder="you@creatormail.com" value={waitEmail} onChange={(e) => setWaitEmail(e.target.value)} />
                </div>
                <div className="waitlist-row">
                  <div>
                    <label className="waitlist-label">Primary Platform</label>
                    <select className="waitlist-select" value={waitPlatform} onChange={(e) => setWaitPlatform(e.target.value)}>
                      <option>Twitch</option>
                      <option>Kick</option>
                      <option>YouTube</option>
                      <option>Multi-platform</option>
                    </select>
                  </div>
                  <div>
                    <label className="waitlist-label">Channel Type</label>
                    <select className="waitlist-select" value={waitChannel} onChange={(e) => setWaitChannel(e.target.value)}>
                      <option>Gaming</option>
                      <option>Just Chatting</option>
                      <option>IRL</option>
                      <option>Podcast</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="waitlist-label">Supported At Launch</div>
                  <div className="waitlist-platforms">
                    <div className="waitlist-badge twitch"><i className="fab fa-twitch"></i> Twitch</div>
                    <div className="waitlist-badge kick"><i className="fas fa-bolt"></i> Kick</div>
                    <div className="waitlist-badge youtube"><i className="fab fa-youtube"></i> YouTube</div>
                  </div>
                </div>
                <button className="btn-primary waitlist-submit" type="submit" disabled={submittingWaitlist}>{submittingWaitlist ? 'Joining…' : 'Join The Waitlist'}</button>
                <div className="waitlist-status">{waitMsg || 'Priority invites are currently going to multi-platform creators and chat-heavy channels.'}</div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <a className="foot-logo" href="/">SECOND CHAT</a>
        <div className="foot-links">
          <a href="#features">Platform</a><a href="#pricing">Solutions</a><a href="#analytics">Developers</a>
          <a href="#waitlist">Company</a><a href="/">Privacy</a><a href="/">Terms</a>
        </div>
        <div className="foot-copy">© 2026 Second Chat Inc.</div>
      </footer>

      {/* Custom Cursor */}
      <div id="cur"></div>
      <div id="cur-ring"></div>
    </div>
  );
};

export default Landing;
