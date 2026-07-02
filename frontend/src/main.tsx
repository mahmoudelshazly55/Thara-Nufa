import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={
        <div style={{ minHeight:'100vh', background:'#020e0d', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid #c5a059', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      }>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
