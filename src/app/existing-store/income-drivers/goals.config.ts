import { FieldKey } from '../shared/fields.dictionary';

export type Mode = 'new' | 'existing';

export interface GoalsSchemaEntry {
  fields: FieldKey[];
  rules?: Record<string, unknown>;
}

const BASE_NEW_FIELDS: FieldKey[] = [
  'avgNetFee',
  'taxPrepReturns',
  'grossTaxPrepFees',
  'discountsPct',
  'discountsAmt',
  'netTaxPrepFees',
  'handlesTaxRush',
  'taxRushReturns',
  'taxRushPercentage',
  'taxRushFee',
  'grossTaxRushFees',
  'otherIncome',
  'totalExpenses',
];

const BASE_EXISTING_FIELDS: FieldKey[] = [
  'lastYearGrossFees',
  'lastYearExpenses',
  'lastYearReturns',
  'lastYearRevenue',
  'avgNetFee',
  'taxPrepReturns',
  'expectedGrowthPct',
  'grossTaxPrepFees',
  'discountsPct',
  'discountsAmt',
  'netTaxPrepFees',
  'handlesTaxRush',
  'taxRushReturns',
  'taxRushPercentage',
  'taxRushFee',
  'grossTaxRushFees',
  'otherIncome',
  'totalExpenses',
];

export const GOALS_SCHEMA: Record<Mode, Record<string, Record<string, GoalsSchemaEntry>>> = {
  new: {
    US: {
      Franchise: {
        fields: [...BASE_NEW_FIELDS],
        rules: {
          taxRushOptional: true,
        },
      },
      Company: {
        fields: [...BASE_NEW_FIELDS],
        rules: {
          // TODO: confirm if company stores use identical validation thresholds.
          taxRushOptional: true,
        },
      },
    },
    CA: {
      Franchise: {
        fields: [...BASE_NEW_FIELDS],
        rules: {
          // TODO: confirm if TaxRush question is mandatory for CA franchises.
          taxRushOptional: false,
        },
      },
      Company: {
        fields: [...BASE_NEW_FIELDS],
        rules: {
          taxRushOptional: false,
        },
      },
    },
  },
  existing: {
    US: {
      Franchise: {
        fields: [...BASE_EXISTING_FIELDS],
        rules: {
          // TODO: confirm expectedGrowthPct presets for franchise vs company.
          growthPresets: true,
        },
      },
      Company: {
        fields: [...BASE_EXISTING_FIELDS],
        rules: {
          growthPresets: true,
        },
      },
    },
    CA: {
      Franchise: {
        fields: [...BASE_EXISTING_FIELDS],
        rules: {
          taxRushOptional: false,
          growthPresets: true,
        },
      },
      Company: {
        fields: [...BASE_EXISTING_FIELDS],
        rules: {
          taxRushOptional: false,
          growthPresets: true,
        },
      },
    },
  },
};

export function schemaFor(mode: Mode, region: string, storeType: string): GoalsSchemaEntry {
  const normalizedMode: Mode = mode ?? 'new';
  const normalizedRegion = (region || 'US').toUpperCase();
  const normalizedStoreType = storeType || 'Franchise';

  const modeSchema = GOALS_SCHEMA[normalizedMode];
  const regionSchema = modeSchema[normalizedRegion] ?? modeSchema.US;

  const entry = regionSchema?.[normalizedStoreType];
  if (entry) {
    return entry;
  }

  const fallback = regionSchema?.Franchise;
  if (fallback) {
    return fallback;
  }

  return GOALS_SCHEMA.new.US.Franchise;
}
