// Global ambient shims for domain data modules used in P&L.
// Safe to remove once real modules exist in the repo.

declare module '../../../../domain/data/calculation-inputs.data' {
  export type CalculationInputs = any;
  const _default: any;
  export default _default;
}

declare module '../../../../domain/data/calculation-results.data' {
  export type CalculationResults = any;
  const _default: any;
  export default _default;
}

declare module '../../../../domain/data/report-data.data' {
  export type ReportData = any;
  const _default: any;
  export default _default;
}

declare module '../../../../domain/data/wizard-state.data' {
  export type WizardState = any;
  const _default: any;
  export default _default;
}

// Broad fallback: any module under this directory exposes common types
declare module '../../../../domain/data/*' {
  export type CalculationInputs = any;
  export type CalculationResults = any;
  export type ReportData = any;
  export type WizardState = any;
  const _default: any;
  export default _default;
}
