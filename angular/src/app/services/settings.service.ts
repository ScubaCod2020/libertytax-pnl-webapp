import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Region = 'US' | 'CA';
export type StoreType = 'existing' | 'new';

export interface AppSettings {
  region: Region;
  storeType: StoreType;
  taxYear: number;
  taxRush: boolean; // CA only
  otherIncome: boolean;
  localAvgRent?: number; // dollars per period
  rentPeriod?: 'monthly' | 'yearly';
}

const STORAGE_KEY = 'pnl_settings_v1';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _settings$ = new BehaviorSubject<AppSettings>(this.read());
  readonly settings$ = this._settings$.asObservable();

  get settings(): AppSettings {
    return this._settings$.getValue();
  }

  update(partial: Partial<AppSettings>): void {
    const next = { ...this.settings, ...partial } satisfies AppSettings;
    this._settings$.next(next);
    this.write(next);
  }

  private read(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppSettings;
    } catch {}
    return {
      region: 'CA',
      storeType: 'existing',
      taxYear: new Date().getFullYear(),
      taxRush: true,
      otherIncome: false,
      localAvgRent: undefined,
      rentPeriod: 'monthly',
    };
  }

  private write(s: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }
}
