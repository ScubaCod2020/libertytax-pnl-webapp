import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportAssemblerService {
  // Compose snapshot from interview, PY, projected, expenses
  composeSnapshot(interview: any, priorYear: any, projected: any, expenses: any) {
    const totalRevenue = (projected?.totalRevenue || 0);
    const totalExpenses = this.sumExpenses(expenses);
    const netIncome = totalRevenue - totalExpenses;
    const totalReturns = projected?.totalReturns || 0;
    const costPerReturn = totalReturns > 0 ? totalExpenses / totalReturns : 0;
    const netMarginPct = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      interview,
      priorYear,
      projected,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome,
      totalReturns,
      costPerReturn,
      netMarginPct,
      generatedAt: new Date().toISOString()
    };
  }

  computeCPR(totalExpenses: number, totalReturns: number): number {
    if (!totalReturns) return 0;
    return totalExpenses / totalReturns;
  }

  private sumExpenses(expenses: any): number {
    if (!expenses || typeof expenses !== 'object') return 0;
    return Object.values(expenses).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0);
  }
}


