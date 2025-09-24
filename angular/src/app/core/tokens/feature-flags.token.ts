import { InjectionToken } from '@angular/core';

export interface FeatureFlags {
  showAnalysisBlock: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Visible during active development; will be toggled off prior to merge to main
  showAnalysisBlock: true,
};

export const FEATURE_FLAGS = new InjectionToken<FeatureFlags>('FEATURE_FLAGS', {
  factory: () => DEFAULT_FEATURE_FLAGS,
});
