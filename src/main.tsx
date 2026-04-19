/**
 * App entry point. Mounts React root and imports global styles.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from "@vercel/analytics/react";
import App from './App';
import './index.css';
import { useEngineStore, engineRuntime } from './store/useEngineStore';

// Dev-only: expose store + runtime for browser console debugging.
if (import.meta.env.DEV) {
  (window as any).__engine = { useEngineStore, engineRuntime };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Analytics />
    <App />
  </React.StrictMode>,
);
