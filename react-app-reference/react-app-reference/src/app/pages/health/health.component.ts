import { Component } from '@angular/core';

@Component({
  selector: 'app-health',
  standalone: true,
  template: `
    <div style="padding:16px;font-family:system-ui">
      <h2>🩺 Health Check</h2>
      <pre style="background:#f5f5f5;padding:12px;border-radius:4px;font-size:12px">BOOT: {{bootOk}}  |  ERROR: {{err}}</pre>
      <div style="margin-top:16px">
        <h3>Boot Details:</h3>
        <ul>
          <li>Boot Status: <strong>{{bootStatus}}</strong></li>
          <li>Timestamp: {{timestamp}}</li>
          <li>User Agent: {{userAgent}}</li>
          <li>Local Storage Available: {{localStorageAvailable}}</li>
        </ul>
      </div>
      <div style="margin-top:16px">
        <h3>Router Status:</h3>
        <p>Current URL: <code>{{currentUrl}}</code></p>
        <p>Available Routes: wizard/step-1, wizard/step-2, dashboard, reports, health</p>
      </div>
    </div>
  `
})
export class HealthComponent {
  bootOk = (window as any).__BOOT_OK__ ?? 'unknown';
  err = this.getStoredError();
  timestamp = new Date().toISOString();
  userAgent = navigator.userAgent.substring(0, 100);
  localStorageAvailable = this.checkLocalStorage();
  currentUrl = window.location.href;

  get bootStatus(): string {
    if (this.bootOk === true) return '✅ OK';
    if (this.bootOk === false) return '❌ FAILED';
    return '⚠️ UNKNOWN';
  }

  private getStoredError(): string {
    try {
      return localStorage.getItem('BOOT_ERROR') ?? 'n/a';
    } catch {
      return 'localStorage unavailable';
    }
  }

  private checkLocalStorage(): boolean {
    try {
      localStorage.setItem('health-test', '1');
      localStorage.removeItem('health-test');
      return true;
    } catch {
      return false;
    }
  }
}
