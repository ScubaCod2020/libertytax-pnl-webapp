import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

// Boot beacons for production triage
console.time('BOOT');
window.addEventListener('error', (e) => console.error('🛑 window.error', e.error || e.message));
window.addEventListener('unhandledrejection', (e: any) => console.error('🛑 unhandledrejection', e.reason));

bootstrapApplication(AppComponent, appConfig)
  .then(() => { 
    (window as any).__BOOT_OK__ = true; 
    console.timeEnd('BOOT'); 
    console.log('✅ BOOT:OK'); 
  })
  .catch((err) => { 
    console.error('🛑 BOOT:FAIL', err); 
    (window as any).__BOOT_OK__ = false; 
  });
