// src/environments/environment.ts
export const environment = {
  production: false,
  // Local dev uses Angular dev-server proxy to avoid CORS
  apiBaseUrl: '/api',
  version: 'local-dev',
  // Enable seeding debug logs for local development
  seedingDebug: true,
  // TEMP: Dev bypass for dashboard route testing
  dashboardDevBypass: true,
};
