import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Captured React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', color: '#ffb4ab', background: '#1c1b1f', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl' }}>
          <h2 style={{ fontSize: '20px', color: '#f2b8b5' }}>یک خطای غیرمنتظره در بارگذاری صفحه رخ داد:</h2>
          <pre style={{ background: '#2b2930', padding: '15px', borderRadius: '8px', overflowX: 'auto', direction: 'ltr', color: '#fff' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '15px', padding: '10px 20px', background: '#d0bcff', color: '#381e72', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            پاک کردن حافظه مرورگر و بارگذاری مجدد
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
