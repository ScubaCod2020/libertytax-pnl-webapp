import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { getHealth } from './lib/apiClient';

const rootEl = document.getElementById('app')!;
// Startup health check (non-blocking)
getHealth()
  .then((h) => console.info('[health] api:', h.status))
  .catch(() => console.warn('[health] api: unavailable'));
createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
