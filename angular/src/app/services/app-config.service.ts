import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { SettingsService } from './settings.service';

export interface AppConfigDerived {
  region: 'US' | 'CA';
  storeType: 'existing' | 'new';
  showTaxRush: boolean; // Only for CA
  showOtherIncome: boolean; // currently always true; kept for future flags
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  constructor(private settings: SettingsService) {}

  readonly config$ = this.settings.settings$.pipe(
    map((s) => ({
      region: s.region,
      storeType: s.storeType,
      showTaxRush: s.region === 'CA',
      showOtherIncome: true,
    }))
  );
}
