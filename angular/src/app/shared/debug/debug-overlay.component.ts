import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugBusService } from './debug-bus.service';

@Component({
  selector: 'app-debug-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible()"
      style="position:fixed; right:8px; bottom:8px; width:360px; max-height:50vh; overflow:auto; background:rgba(0,0,0,0.8); color:#fff; padding:8px; font-size:12px; border-radius:6px; z-index:9999;"
    >
      <div
        style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"
      >
        <strong>Debug Trace</strong>
        <button
          (click)="toggle()"
          style="background:#444; color:#fff; border:none; padding:2px 6px; border-radius:3px;"
        >
          Hide
        </button>
      </div>
      <div
        *ngFor="let e of events() | slice: -20"
        style="border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;"
      >
        <div>
          [{{ e.feature }}] {{ e.kind }} <span style="opacity:.7">#{{ e.traceId }}</span>
        </div>
        <div style="opacity:.8">{{ e.ts | date: 'mediumTime' }}</div>
      </div>
    </div>
  `,
})
export class DebugOverlayComponent {
  private bus = inject(DebugBusService);
  private lsKey = 'debug.overlay';

  visible = signal<boolean>(false);
  events = signal<any[]>([]);

  constructor() {
    try {
      this.visible.set(localStorage.getItem(this.lsKey) === 'on');
    } catch {}
    this.bus.events$.subscribe((arr) => this.events.set(arr));
    (window as any).__APP_DEBUG__ = (window as any).__APP_DEBUG__ || {};
    (window as any).__APP_DEBUG__.toggleOverlay = () => this.toggle();
  }

  toggle(): void {
    const next = !this.visible();
    this.visible.set(next);
    try {
      localStorage.setItem(this.lsKey, next ? 'on' : 'off');
    } catch {}
  }
}
