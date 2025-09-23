import { ErrorHandler, Injectable } from '@angular/core';
import { DebugPanelService } from './debug-panel.service';

@Injectable()
export class DebugErrorHandler implements ErrorHandler {
  constructor(private readonly debug: DebugPanelService) {}

  handleError(error: any): void {
    try {
      console.error('App Error:', error);
      // Open the debug panel on error; future: push error details into a log stream
      this.debug.open();
    } catch {}
  }
}


