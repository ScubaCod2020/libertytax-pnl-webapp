import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withRouterConfig, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { logger } from './app/core/logger';
import { AppComponent } from './app/app.component';
import { ApiClientService } from './app/services/api-client.service';

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
import('./app/services/api-client.service').then((m) =>
  new m.ApiClientService()
    .getHealth()
    .then((h) => logger.info('[health] api:', h.status))
    .catch(() => logger.warn('[health] api: unavailable'))
);
