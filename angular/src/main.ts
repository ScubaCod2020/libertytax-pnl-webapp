import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { ApiClientService } from './app/services/api-client.service';

bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] })
  .catch(err => console.error(err));

// Startup health check (non-blocking)
// Using dynamic import to avoid strict DI setup here
import('./app/services/api-client.service').then(m => new m.ApiClientService().getHealth()
  .then(h => console.info('[health] api:', h.status))
  .catch(() => console.warn('[health] api: unavailable')));
