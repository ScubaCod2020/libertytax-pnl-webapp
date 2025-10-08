import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { CalculationResults, AppState, Region } from '../models/wizard.models';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {
  private resultsSubject = new BehaviorSubject<CalculationResults>({
    grossFees: 0,
    discounts: 0,
    taxPrepIncome: 0,
    taxRushIncome: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    netMarginPct: 0,
    costPerReturn: 0,
    totalReturns: 0
  });

  public results$ = this.resultsSubject.asObservable();

  calculateResults(state: AppState): CalculationResults {
    console.log('🧮 Calculating results for state:', state);
    
    const grossFees = state.avgNetFee * state.taxPrepReturns;
    const discounts = grossFees * (state.discountsPct / 100);
    const taxPrepIncome = grossFees - discounts;
    
    // TaxRush calculation (Canada only)
    const taxRushIncome = state.region === 'CA' ? 
      (state.taxRushReturns * state.avgNetFee * 0.15) : 0;
    
    const totalRevenue = taxPrepIncome + taxRushIncome + state.otherIncome;
    
    // Calculate total expenses based on percentages and fixed amounts
    const totalExpenses = this.calculateTotalExpenses(state, grossFees);
    
    const netIncome = totalRevenue - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
    const costPerReturn = state.taxPrepReturns > 0 ? totalExpenses / state.taxPrepReturns : 0;
    const totalReturns = state.taxPrepReturns + (state.taxRushReturns || 0);

    const results: CalculationResults = {
      grossFees,
      discounts,
      taxPrepIncome,
      taxRushIncome,
      totalRevenue,
      totalExpenses,
      netIncome,
      netMarginPct,
      costPerReturn,
      totalReturns
    };

    console.log('🧮 Calculated results:', results);
    this.resultsSubject.next(results);
    return results;
  }

  private calculateTotalExpenses(state: AppState, grossFees: number): number {
    let total = 0;
    
    // Percentage-based expenses
    total += grossFees * (state.salariesPct / 100);
    total += grossFees * (state.empDeductionsPct / 100);
    total += grossFees * (state.rentPct / 100);
    total += grossFees * (state.suppliesPct / 100);
    total += grossFees * (state.royaltiesPct / 100);
    total += grossFees * (state.advRoyaltiesPct / 100);
    total += grossFees * (state.taxRushRoyaltiesPct / 100);
    total += grossFees * (state.miscPct / 100);
    
    // Fixed amount expenses
    total += state.telephoneAmt;
    total += state.utilitiesAmt;
    total += state.localAdvAmt;
    total += state.insuranceAmt;
    total += state.postageAmt;
    total += state.duesAmt;
    total += state.bankFeesAmt;
    total += state.maintenanceAmt;
    total += state.travelEntAmt;
    
    return total;
  }

  get currentResults(): CalculationResults {
    return this.resultsSubject.value;
  }
}
