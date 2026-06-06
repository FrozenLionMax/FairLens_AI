import React from 'react';
import Dashboard from './Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FairLens Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg,#080e1f 0%,#0d1535 50%,#080e1f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
          padding: 32,
        }}>
          <div style={{
            background: 'rgba(17,25,52,0.9)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 20,
            padding: '48px 40px',
            maxWidth: 520,
            textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 28,
            }}>
              ⚠️
            </div>
            <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
              FairLens encountered an unexpected error. This doesn't affect your data — try refreshing the page.
            </p>
            <details style={{ textAlign: 'left', marginBottom: 24 }}>
              <summary style={{ color: '#64748b', fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
                Technical Details
              </summary>
              <pre style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12,
                color: '#ef4444', fontSize: 11, overflow: 'auto', maxHeight: 120,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
                color: '#fff', fontWeight: 700, padding: '14px 32px',
                borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 15, boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
              }}
            >
              Reload FairLens
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}