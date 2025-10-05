import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppMetaService {
  setTitle(str: string): void {
    try {
      document.title = str;
    } catch {}
  }
  setDesc(str: string): void {
    try {
      let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute('name', 'description');
        document.head.appendChild(m);
      }
      m.setAttribute('content', str);
    } catch {}
  }
}
