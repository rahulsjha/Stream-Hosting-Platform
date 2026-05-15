import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-canvas"></div>
      <div className="scanlines"></div>
      <div className="vignette"></div>

      {/* Navigation */}
      <nav className="auth-nav">
        <Link to="/" className="auth-nav-logo">
          <img src="/assets/logo.png" alt="SIL" className="auth-nav-logo-img" />
        </Link>

        <div className="nav-right">
          <div className="nav-status">
            <span className="live-dot"></span>
            <span>System Online</span>
          </div>
        </div>
      </nav>

      {/* Auth Wrapper */}
      <div className="auth-wrap">
        {/* Left Panel */}
        <div className="auth-panel-left">
          <div className="panel-brand">
            <Link to="/" className="panel-logo">
              <img src="/assets/logo.png" alt="SIL" className="panel-logo-img" />
            </Link>

            <h2 className="panel-headline">
              <span className="l1">Stream to All</span>
              <span className="l2">Platforms</span>
              <span className="l3">at Once</span>
            </h2>

            <p className="panel-desc">
              Go live on <strong>YouTube, Twitch, and Kick simultaneously</strong> with
              professional quality and zero setup hassle. One stream, infinite reach.
            </p>
          </div>

          {/* Testimonials */}
          <div className="panel-testimonials">
            <div className="panel-testimonial">
              <div className="test-quote">
                "Best multi-platform streaming solution. Saved me hours of setup time."
              </div>
              <div className="test-author">
                <div className="test-avatar" style={{ backgroundColor: '#ff4757' }}>A</div>
                <div className="test-name">alex_streamer</div>
              </div>
            </div>

            <div className="panel-testimonial">
              <div className="test-quote">
                "The BRB health monitoring just saved my stream during technical issues."
              </div>
              <div className="test-author">
                <div className="test-avatar" style={{ backgroundColor: '#00e5a0' }}>J</div>
                <div className="test-name">jordan_live</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-panel-right">
          <div className="form-container">
            <h3 className="form-title">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h3>
            <p className="form-subtitle">
              {isLogin
                ? 'Welcome back. Sign in to access your dashboard.'
                : 'Get started with multi-platform streaming in seconds.'}
            </p>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Email - only for registration */}
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle Login/Register */}
            <div className="form-footer">
              <p>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  className="toggle-auth"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Terms */}
            <div className="form-terms">
              <p>
                By signing up, you agree to our
                <a href="#"> Terms of Service</a> and <a href="#">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Cursor */}
      <div id="auth-cur"></div>
      <div id="auth-cur-ring"></div>
    </div>
  );
};

export default Login;
