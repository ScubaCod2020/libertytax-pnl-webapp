import { Injectable, computed, signal } from '@angular/core';
import { DEFAULT_DASHBOARD_FLAGS, DashboardFlags } from '../_types/dashboard-flags';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly _flags = signal<DashboardFlags>({ ...DEFAULT_DASHBOARD_FLAGS });
  private readonly _anfValue = signal<number>(0);

  readonly anfStatus = computed<'good' | 'warn' | 'bad'>(() => {
    const v = this._anfValue();
    if (v >= 0.2) return 'good';
    if (v >= 0.1) return 'warn';
    return 'bad';
  });

  get flags() {
    return this._flags();
  }
  get anfValue() {
    return this._anfValue();
  }

  setFlags(patch: Partial<DashboardFlags>) {
    this._flags.update((f) => ({ ...f, ...patch }));
  }
  setAnfValue(v: unknown) {
    const n = typeof v === 'number' ? v : Number(v ?? 0);
    this._anfValue.set(Number.isFinite(n) ? n : 0);
  }
}
