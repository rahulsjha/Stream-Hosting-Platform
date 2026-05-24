import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console and (optionally) send to a monitoring endpoint
    // Keep this lightweight for production builds.
    // eslint-disable-next-line no-console
    console.error('Uncaught error in React tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || 'Unknown error';
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#fff', background: '#0b0b0d', minHeight: '100vh' }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
          <p style={{ color: '#ddd' }}>{message}</p>
          <details style={{ whiteSpace: 'pre-wrap', color: '#bbb' }}>
            {String(this.state.error && this.state.error.stack)}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
