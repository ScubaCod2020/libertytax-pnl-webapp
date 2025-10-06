import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

export interface RentGuardCheck {
  recommendedMaxPctOfRevenue: number; // e.g., 0.10 for 10%
  localAvgMonthly?: number; // normalized to monthly
}

@Injectable({ providedIn: 'root' })
export class RentGuardService {
  constructor(private settings: SettingsService) {}

  getConfig(): RentGuardCheck {
    const s = this.settings.settings;
    const monthly =
      s.localAvgRent && s.rentPeriod === 'yearly' ? s.localAvgRent / 12 : s.localAvgRent;
    // Placeholder: use 10% of gross income rule of thumb
    return { recommendedMaxPctOfRevenue: 0.1, localAvgMonthly: monthly };
  }
}
