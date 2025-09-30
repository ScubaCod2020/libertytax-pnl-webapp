import { Injectable } from '@angular/core';
import type { WizardAnswers } from '../../../domain/types/wizard.types';
import { KpiRulesV2Service, type KpiEvaluationResult } from './kpi-rules-v2.service';

export interface KpiAdapterResult extends KpiEvaluationResult {
  source: 'kpi-rules-v2';
}

@Injectable({ providedIn: 'root' })
export class KpiAdapterService {
  constructor(private readonly rulesV2: KpiRulesV2Service) {}

  evaluateFromWizard(answers: WizardAnswers): KpiAdapterResult {
    const result = this.rulesV2.evaluate({
      rentMonthly: answers.rentPct,
      rentRevenuePct: answers.rentPct,
      rentOwnerOccupied: false, // TODO: derive from answers when field exists
      payrollPct: answers.payrollPct,
      marketingPct: answers.localAdvAmt,
      techPct: answers.suppliesPct,
      miscPct: answers.miscPct,
      storeType: answers.storeType,
    });
    return { ...result, source: 'kpi-rules-v2' };
  }
}
