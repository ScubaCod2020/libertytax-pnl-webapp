import { bootstrapApplication } from '@angular/platform-browser';
import { ErrorHandler } from '@angular/core';
import { provideRouter, withRouterConfig, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { logger } from './app/core/logger';
import { AppComponent } from './app/app.component';
import { ApiClientService } from './app/services/api-client.service';
import { DebugErrorHandler } from './app/components/debug-panel/debug-error.handler';

// Production hardening for previews: silence verbose logs unless ?debug=1
try {
  const host = window.location?.hostname || '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const params = new URLSearchParams(window.location.search || '');
  const debugOverride = params.get('debug') === '1' || localStorage.getItem('debug_ui_trace') === '1';
  if (!isLocal && !debugOverride) {
    (window as any).__LOG_LEVEL__ = 'error';
    try {
      localStorage.removeItem('debug_ui_trace');
      localStorage.removeItem('debug_calcs');
    } catch { }
    try {
      // Keep warnings/errors, drop noisy logs
      console.debug = () => { };
      console.log = () => { };
      console.info = () => { };
    } catch { }
  }
} catch { }

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    { provide: ErrorHandler, useClass: DebugErrorHandler },
  ],
}).catch((err) => logger.error(err));

// Startup health check (non-blocking)
// Using dynamic import to avoid strict DI setup here
try {
  const enableHealth = (window as any).__ENABLE_API_HEALTH__ === true;
  if (enableHealth) {
    import('./app/services/api-client.service').then((m) =>
      new m.ApiClientService()
        .getHealth()
        .then((h) => logger.info('[health] api:', h.status))
        .catch(() => logger.warn('[health] api: unavailable'))
    );
  }
} catch { }
