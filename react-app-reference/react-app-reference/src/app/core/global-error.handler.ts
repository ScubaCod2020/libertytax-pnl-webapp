import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    try {
      const msg = (error && (error.stack || error.message || String(error))) || 'Unknown error';
      // persist for later inspection on Vercel
      localStorage.setItem('BOOT_ERROR', `[${new Date().toISOString()}] ${msg}`);
      console.error('🛑 GlobalErrorHandler:', error);
      
      // lightweight user-facing banner
      const el = document.getElementById('boot-error-banner') || document.createElement('div');
      el.id = 'boot-error-banner';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ffefef;color:#900;padding:8px 12px;z-index:9999;font:12px/1.4 system-ui';
      el.textContent = 'App error occurred. See console for details.';
      document.body.appendChild(el);
    } catch {
      // Silent fail in error handler
    }
  }
}
