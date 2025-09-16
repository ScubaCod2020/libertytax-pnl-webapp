import type { FieldKey } from '../shared/fields.dictionary';

export type Mode = 'new' | 'existing';

export interface GoalsSchemaEntry {
  id: string;
  fields: FieldKey[];
}

const BASE_FIELDS: FieldKey[] = [
  'avgNetFee',
  'taxPrepReturns',
  'grossTaxPrepFees',
  'discountsPct',
  'discountsAmt',
  'netTaxPrepIncome',
  'otherIncome',
  'totalRevenue'
];

const TAXRUSH_FIELDS: FieldKey[] = [
  'taxRushReturns',
  'taxRushPercentage',
  'taxRushFee',
  'taxRushIncome'
];

export function schemaFor(mode: Mode, region: string, storeType: string): GoalsSchemaEntry {
  const fields: FieldKey[] = [...BASE_FIELDS];

  if (region === 'CA') {
    const insertIndex = fields.indexOf('grossTaxPrepFees');
    const before = insertIndex >= 0 ? fields.slice(0, insertIndex) : fields.slice();
    const after = insertIndex >= 0 ? fields.slice(insertIndex) : [];
    const ordered = [...before, ...TAXRUSH_FIELDS, ...after];
    fields.splice(0, fields.length, ...ordered);
  }

  const id = `${mode}-${region}-${storeType}`;

  return {
    id,
    fields
  };
}
