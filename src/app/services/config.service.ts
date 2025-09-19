import { Injectable } from '@angular/core';
import configData from '../config/kpi.config.json';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly kpiConfig = configData as any;

  get expensesPctConfig() {
    return this.kpiConfig.expensesPct;
  }

  get netPctConfig() {
    if (this.kpiConfig.netPct?.mirrorFromExpenses) {
      return this.kpiConfig.expensesPct;
    }
    return this.kpiConfig.netPct;
  }
}


