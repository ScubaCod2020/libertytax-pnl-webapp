// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://prod.api.example.com/api',
  version: 'production',
  // Disable seeding debug logs for production
  seedingDebug: false,
  // TEMP: Dev bypass disabled for production
  dashboardDevBypass: false,
};
