import { Component, type ReactNode } from 'react';

interface State { hasError: boolean; msg: string }

// Catches any render crash and offers a one-click recovery
// (clears cached data) instead of showing a blank white page.
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, msg: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, msg: err?.message || 'حدث خطأ غير متوقع' };
  }

  componentDidCatch(err: Error) {
    // eslint-disable-next-line no-console
    console.error('Platform error:', err);
  }

  reset = () => {
    try {
      localStorage.removeItem('elda3ia-platform-v5');
      localStorage.removeItem('elda3ia-webapp-url');
    } catch { /* */ }
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0f0d', color: '#f5f5f4', fontFamily: 'Cairo, sans-serif', padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: 'center', background: '#141b18', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔧</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>حدثت مشكلة بسيطة</h1>
          <p style={{ color: '#a8a29e', fontSize: 14, margin: '0 0 20px' }}>
            يبدو أن بيانات محفوظة قديمة سببت خطأ. اضغط الزر لإعادة التحميل وإصلاح المشكلة تلقائياً.
          </p>
          <button onClick={this.reset} style={{ background: '#2dd4bf', color: '#0a0f0d', border: 0, padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
            إعادة التحميل والإصلاح
          </button>
        </div>
      </div>
    );
  }
}
