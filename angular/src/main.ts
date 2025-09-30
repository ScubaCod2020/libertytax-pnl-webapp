import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withRouterConfig, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { logger } from './app/core/logger';
import { AppComponent } from './app/app.component';
import { ApiClientService } from './app/services/api-client.service';

// Production hardening for previews: silence verbose logs and clear debug flags on non-localhost
try {
  const host = window.location?.hostname || '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (!isLocal) {
    (window as any).__LOG_LEVEL__ = 'error';
    try {
      localStorage.removeItem('debug_ui_trace');
      localStorage.removeItem('debug_calcs');
    } catch {}
    try {
      // Keep warnings/errors, drop noisy logs
      console.debug = () => {};
      console.log = () => {};
      console.info = () => {};
    } catch {}
  }
} catch {}

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
} catch {}
