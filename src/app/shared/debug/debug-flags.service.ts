import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DebugFlagsService {
  private router = inject(Router);
  private _enabled = new BehaviorSubject<boolean>(false);
  readonly enabled$ = this._enabled.asObservable();

  constructor() {
    try {
      const hasParam =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('debug') === '1';
      const persisted =
        typeof sessionStorage !== 'undefined' && sessionStorage.getItem('debug') === '1';
      this._enabled.next(!!(hasParam || persisted));

      // keyboard toggle: Ctrl+`
      if (typeof window !== 'undefined') {
        fromEvent<KeyboardEvent>(window, 'keydown').subscribe((e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === '`') {
            const v = !this._enabled.value;
            this._enabled.next(v);
            try {
              sessionStorage.setItem('debug', v ? '1' : '0');
            } catch {}
          }
        });
      }
    } catch {}
  }

  set(v: boolean) {
    this._enabled.next(v);
    try {
      sessionStorage.setItem('debug', v ? '1' : '0');
    } catch {}
  }
}
