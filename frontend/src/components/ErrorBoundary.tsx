import React from 'react';

interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode; lang?: string }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  render() {
    const lang = this.props.lang || 'ar';
    if (this.state.hasError) return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        minHeight:'100vh', background:'#010b0a', color:'white', fontFamily:'sans-serif', textAlign:'center', padding:32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: "#c5a059", marginBottom: 8 }}>
          {lang === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          {lang === 'ar'
            ? 'نعتذر عن هذا الخطأ. يمكنك تحديث الصفحة أو العودة للصفحة الرئيسية.'
            : 'We apologize for this error. You can refresh the page or return to the home page.'}
        </p>
        <button
          onClick={() => { window.location.assign('/'); }}
          style={{ background: '#c5a059', color: '#042f2e', border: 'none', borderRadius: 12,
            padding: '12px 24px', fontWeight: 900, cursor: 'pointer', fontSize: 14 }}>
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    );
    return this.props.children;
  }
}
