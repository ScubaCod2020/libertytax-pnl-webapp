// Minimal ambient declarations to satisfy current imports.
// Extend later with real fields as they stabilize.

declare module '../../../../domain/data/calculation-inputs.data' {
  export interface CalculationInputs {
    [key: string]: unknown;
  }
  export const defaultCalculationInputs: CalculationInputs;
}

declare module '../../../../domain/data/calculation-results.data' {
  export interface CalculationResults {
    [key: string]: unknown;
  }
  export const defaultCalculationResults: CalculationResults;
}

declare module '../../../../domain/data/report-data.data' {
  export interface ReportData {
    monthlyData?: unknown[];
    [key: string]: unknown;
  }
  export const defaultReportData: ReportData;
}

declare module '../../../../domain/data/wizard-state.data' {
  export interface WizardState {
    [key: string]: unknown;
  }
  export const defaultWizardState: WizardState;
}
