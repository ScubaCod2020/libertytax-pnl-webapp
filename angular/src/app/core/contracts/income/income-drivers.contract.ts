export type PresetId = 'good' | 'better' | 'best' | 'custom';

export interface IncomeDrivers {
  returns: number;
  avgNetFee: number;
  discountsPct?: number; // 0..1
  discountsAmt?: number; // $
  otherIncome?: number; // $
  tr_returns?: number; // CA TaxRush (gated)
  tr_avgNetFee?: number; // CA TaxRush (gated)
  region: 'US' | 'CA';
  storeType: 'new' | 'existing';
  handlesTaxRush?: boolean;
  baseline?: 'target' | 'projected' | 'generic';
}

export interface IncomePreset {
  id: PresetId;
  deltaPctByScope: Partial<Record<'returns' | 'avgNetFee', number>>; // e.g. +0.02
}
