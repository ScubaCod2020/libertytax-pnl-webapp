import { Injectable } from '@angular/core';
import { WizardAnswers } from '../types/wizard.types';
import { SuggestionProfile, CalculatedSuggestions, SuggestionProfileRegistry } from '../types/suggestion.types';

@Injectable({
  providedIn: 'root'
})
export class SuggestionEngineService {
  
  // Sample suggestion profiles (subset for demo - full profiles would be loaded from config)
  private readonly profiles: SuggestionProfileRegistry = {
    'CA-new-standard': {
      name: 'Canada - New Store (Standard)',
      description: 'Typical new Canadian franchise without TaxRush',
      region: 'CA',
      storeType: 'new',
      handlesTaxRush: false,
      avgNetFee: 125,
      taxPrepReturns: 1500,
      discountsPct: 3.5,
      otherIncome: 2000,
      expenses: {
        salariesPct: 35.0,
        empDeductionsPct: 12.0,
        rentPct: 8.5,
        telephoneAmt: 2400,
        utilitiesAmt: 3600,
        localAdvAmt: 4800,
        insuranceAmt: 2400,
        postageAmt: 600,
        suppliesPct: 2.5,
        duesAmt: 800,
        bankFeesAmt: 1200,
        maintenanceAmt: 1800,
        travelEntAmt: 2400,
        royaltiesPct: 7.0,
        advRoyaltiesPct: 3.0,
        taxRushRoyaltiesPct: 0,
        taxRushShortagesPct: 0,
        miscPct: 1.5
      }
    },
    'US-new-standard': {
      name: 'US - New Store (Standard)',
      description: 'Typical new US franchise',
      region: 'US',
      storeType: 'new',
      handlesTaxRush: false,
      avgNetFee: 130,
      taxPrepReturns: 1680,
      discountsPct: 3.0,
      otherIncome: 5000,
      expenses: {
        salariesPct: 38.0,
        empDeductionsPct: 11.0,
        rentPct: 9.0,
        telephoneAmt: 2200,
        utilitiesAmt: 3200,
        localAdvAmt: 6000,
        insuranceAmt: 3600,
        postageAmt: 800,
        suppliesPct: 2.8,
        duesAmt: 1000,
        bankFeesAmt: 1500,
        maintenanceAmt: 2000,
        travelEntAmt: 3000,
        royaltiesPct: 7.0,
        advRoyaltiesPct: 3.0,
        taxRushRoyaltiesPct: 0,
        taxRushShortagesPct: 0,
        miscPct: 2.0
      }
    }
  };

  /**
   * Calculate suggestions based on profile and current user inputs
   */
  calculateSuggestions(
    profile: SuggestionProfile,
    currentAnswers?: Partial<WizardAnswers>
  ): CalculatedSuggestions {
    // Use current user inputs if available, otherwise profile defaults
    const avgNetFee = currentAnswers?.avgNetFee ?? profile.avgNetFee;
    const taxPrepReturns = currentAnswers?.taxPrepReturns ?? profile.taxPrepReturns;
    const discountsPct = currentAnswers?.discountsPct ?? profile.discountsPct;
    const otherIncome = currentAnswers?.otherIncome ?? profile.otherIncome ?? 0;

    // TaxRush calculations
    const taxRushReturns = profile.handlesTaxRush
      ? (currentAnswers?.taxRushReturns ?? profile.taxRushReturns ?? 0)
      : 0;
    const taxRushAvgNetFee = profile.handlesTaxRush
      ? (currentAnswers?.taxRushAvgNetFee ?? profile.taxRushAvgNetFee ?? 0)
      : 0;

    // Calculate flow: inputs → calculations → results
    const grossFees = avgNetFee * taxPrepReturns;
    const discountAmount = grossFees * (discountsPct / 100);
    const taxPrepIncome = grossFees - discountAmount;
    const taxRushIncome = taxRushReturns * taxRushAvgNetFee;
    const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome;

    // Calculate individual expenses based on profile
    const salariesAmount = totalRevenue * (profile.expenses.salariesPct / 100);
    const totalExpenses = this.calculateTotalExpenses(profile, totalRevenue, salariesAmount);
    const netIncome = totalRevenue - totalExpenses;

    return {
      // Input fields
      avgNetFee,
      taxPrepReturns,
      discountsPct,
      taxRushReturns,
      taxRushAvgNetFee,
      otherIncome,

      // Calculated revenue fields
      grossFees,
      discountAmount,
      taxPrepIncome,
      taxRushIncome,
      totalRevenue,

      // Calculated expense fields
      totalExpenses,
      netIncome,

      // Individual expense suggestions
      salariesPct: profile.expenses.salariesPct,
      empDeductionsPct: profile.expenses.empDeductionsPct,
      rentPct: profile.expenses.rentPct,
      telephoneAmt: profile.expenses.telephoneAmt,
      utilitiesAmt: profile.expenses.utilitiesAmt,
      localAdvAmt: profile.expenses.localAdvAmt,
      insuranceAmt: profile.expenses.insuranceAmt,
      postageAmt: profile.expenses.postageAmt,
      suppliesPct: profile.expenses.suppliesPct,
      duesAmt: profile.expenses.duesAmt,
      bankFeesAmt: profile.expenses.bankFeesAmt,
      maintenanceAmt: profile.expenses.maintenanceAmt,
      travelEntAmt: profile.expenses.travelEntAmt,
      royaltiesPct: profile.expenses.royaltiesPct,
      advRoyaltiesPct: profile.expenses.advRoyaltiesPct,
      taxRushRoyaltiesPct: profile.expenses.taxRushRoyaltiesPct,
      taxRushShortagesPct: profile.expenses.taxRushShortagesPct,
      miscPct: profile.expenses.miscPct
    };
  }

  /**
   * Get suggestion profile by key
   */
  getProfile(profileKey: string): SuggestionProfile | undefined {
    return this.profiles[profileKey];
  }

  /**
   * Get all available profiles
   */
  getAllProfiles(): SuggestionProfileRegistry {
    return { ...this.profiles };
  }

  /**
   * Get profiles filtered by region and store type
   */
  getProfilesForContext(region: string, storeType: string): SuggestionProfile[] {
    return Object.values(this.profiles).filter(
      profile => profile.region === region && profile.storeType === storeType
    );
  }

  /**
   * Calculate total expenses from individual expense components
   */
  private calculateTotalExpenses(
    profile: SuggestionProfile, 
    totalRevenue: number, 
    salariesAmount: number
  ): number {
    const expenses = profile.expenses;
    
    // Calculate percentage-based expenses
    const salaries = salariesAmount;
    const empDeductions = salaries * (expenses.empDeductionsPct / 100);
    const rent = totalRevenue * (expenses.rentPct / 100);
    const supplies = totalRevenue * (expenses.suppliesPct / 100);
    const royalties = totalRevenue * (expenses.royaltiesPct / 100);
    const advRoyalties = totalRevenue * (expenses.advRoyaltiesPct / 100);
    const taxRushRoyalties = totalRevenue * (expenses.taxRushRoyaltiesPct / 100);
    const taxRushShortages = totalRevenue * (expenses.taxRushShortagesPct / 100);
    const misc = totalRevenue * (expenses.miscPct / 100);

    // Fixed amount expenses
    const fixedExpenses = expenses.telephoneAmt + expenses.utilitiesAmt + 
                         expenses.localAdvAmt + expenses.insuranceAmt + 
                         expenses.postageAmt + expenses.duesAmt + 
                         expenses.bankFeesAmt + expenses.maintenanceAmt + 
                         expenses.travelEntAmt;

    return Math.round(
      salaries + empDeductions + rent + supplies + royalties + 
      advRoyalties + taxRushRoyalties + taxRushShortages + misc + fixedExpenses
    );
  }
}
