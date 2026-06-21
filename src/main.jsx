import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
    // Attempt to log to console and visually
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#500', color: 'white', minHeight: '100vh', fontFamily: 'monospace', whiteSpace: 'pre-wrap', zIndex: 99999, position: 'relative' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Frontend Crash Detected</h1>
          <p style={{ color: '#faa', fontSize: '16px' }}>{this.state.error && this.state.error.toString()}</p>
          <hr style={{ margin: '20px 0', borderColor: '#a55' }} />
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
