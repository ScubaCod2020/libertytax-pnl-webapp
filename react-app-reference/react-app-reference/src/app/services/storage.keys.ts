// Centralized storage key constants
// All localStorage/sessionStorage keys should be defined here to avoid duplication

export const STORAGE_KEYS = {
  PROD_DATA: 'liberty-tax-pnl-data',
  DEBUG_SETTINGS: 'debug-settings',
} as const;

// Type helper for storage keys
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
