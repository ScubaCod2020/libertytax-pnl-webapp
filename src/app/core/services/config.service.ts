import { Injectable, Inject } from '@angular/core';
import {
  DEFAULT_REGION_CONFIGS,
  REGION_CONFIGS,
  type RegionCode,
  type RegionConfig,
} from '../tokens/region-configs.token';
import { WizardStateService } from './wizard-state.service';

export interface EffectiveConfig extends RegionConfig {
  selections: ReturnType<WizardStateService['getSelections']>;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(
    private readonly wizardState: WizardStateService,
    @Inject(REGION_CONFIGS)
    private readonly regionConfigs: Record<RegionCode, RegionConfig> = DEFAULT_REGION_CONFIGS
  ) {}

  getEffectiveConfig(): EffectiveConfig {
    const selections = this.wizardState.getSelections();
    const base = this.regionConfigs[selections.region] ?? DEFAULT_REGION_CONFIGS.US;
    return { ...base, selections };
  }
}
