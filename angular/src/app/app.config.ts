import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DebugErrorHandler } from './components/debug-panel/debug-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), { provide: ErrorHandler, useClass: DebugErrorHandler }]
};
