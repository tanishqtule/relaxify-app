
import React from 'react';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Relaxify error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="h-screen flex items-center justify-center p-8"
          style={{ background: 'var(--bg-page)' }}
        >
          <div
            className="text-center max-w-md p-10 rounded-[40px] premium-shadow"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
            }}
          >
            <p className="text-5xl mb-5">⚡</p>
            <h2
              className="text-2xl font-black mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Something went wrong
            </h2>
            <p
              className="text-sm mb-8 leading-relaxed font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-8 py-3 rounded-2xl font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, #38F9D7, #20C997)',
                color: '#071220',
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
