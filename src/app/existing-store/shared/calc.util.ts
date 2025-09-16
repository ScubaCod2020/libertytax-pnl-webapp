export interface GrossFeeOptions {
  region?: string;
  handlesTaxRush?: boolean;
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function calculateGrossTaxPrepFees(
  avgNetFee: unknown,
  taxPrepReturns: unknown,
  taxRushReturns: unknown,
  options: GrossFeeOptions = {}
): number | null {
  const anf = asNumber(avgNetFee);
  const returns = asNumber(taxPrepReturns);
  const rushReturns = asNumber(taxRushReturns) ?? 0;

  if (anf === null || returns === null) {
    return null;
  }

  if (options.region === 'CA' && options.handlesTaxRush) {
    const netReturns = Math.max(returns - rushReturns, 0);
    return Math.round(netReturns * anf);
  }

  return Math.round(anf * returns);
}

export function calculateDiscountAmount(grossFees: unknown, discountsPct: unknown): number | null {
  const gross = asNumber(grossFees);
  const pct = asNumber(discountsPct);

  if (gross === null || pct === null) {
    return null;
  }

  return Math.round(gross * (pct / 100));
}

export function calculateNetTaxPrepIncome(grossFees: unknown, discountAmount: unknown): number | null {
  const gross = asNumber(grossFees);
  const discount = asNumber(discountAmount) ?? 0;

  if (gross === null) {
    return null;
  }

  return Math.round(gross - discount);
}

export function calculateTaxRushReturns(taxPrepReturns: unknown, taxRushPercentage: unknown): number | null {
  const returns = asNumber(taxPrepReturns);
  const pct = asNumber(taxRushPercentage);

  if (returns === null || pct === null) {
    return null;
  }

  return Math.round(returns * (pct / 100));
}

export function calculateTaxRushPercentage(taxPrepReturns: unknown, taxRushReturns: unknown): number | null {
  const returns = asNumber(taxPrepReturns);
  const rush = asNumber(taxRushReturns);

  if (returns === null || returns === 0 || rush === null) {
    return null;
  }

  return Math.round((rush / returns) * 1000) / 10;
}

export function calculateTaxRushIncome(taxRushReturns: unknown, taxRushFee: unknown): number | null {
  const rushReturns = asNumber(taxRushReturns);
  const rushFee = asNumber(taxRushFee);

  if (rushReturns === null || rushFee === null) {
    return null;
  }

  return Math.round(rushReturns * rushFee);
}

export function calculateTotalRevenue(
  netTaxPrepIncome: unknown,
  taxRushIncome: unknown,
  otherIncome: unknown
): number | null {
  const netIncome = asNumber(netTaxPrepIncome) ?? 0;
  const rushIncome = asNumber(taxRushIncome) ?? 0;
  const other = asNumber(otherIncome) ?? 0;

  const sum = netIncome + rushIncome + other;
  return Number.isFinite(sum) ? Math.round(sum) : null;
}
