import { Injectable } from '@angular/core';
import type { RegionCode } from '../tokens/region-configs.token';

export type StoreType = 'new' | 'existing';

export interface WizardSelections {
  region: RegionCode;
  storeType: StoreType;
  handlesTaxRush: boolean;
  hasOtherIncome: boolean;
  localAvgRent?: number;
  sqft?: number;
}

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private selections: WizardSelections = {
    region: 'US',
    storeType: 'new',
    handlesTaxRush: false,
    hasOtherIncome: false,
  };

  getSelections(): WizardSelections {
    return { ...this.selections };
  }

  updateSelections(update: Partial<WizardSelections>): void {
    this.selections = { ...this.selections, ...update };
  }
}
