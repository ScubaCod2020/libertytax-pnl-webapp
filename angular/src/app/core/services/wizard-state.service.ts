import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { RegionCode } from '../tokens/region-configs.token';
import type { WizardAnswers } from '../../domain/types/wizard.types';
import { BiDirService } from './bidir/bidir.service';

export type StoreType = 'new' | 'existing';

export interface WizardSelections {
  region: RegionCode;
  storeType: StoreType;
  handlesTaxRush: boolean;
  hasOtherIncome: boolean;
  localAvgRent?: number;
  sqft?: number;
}

const STORAGE_KEY = 'wizard_state_v1';

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private readonly _answers$ = new BehaviorSubject<WizardAnswers>(this.loadFromStorage());
  readonly answers$ = this._answers$.asObservable();

  private selections: WizardSelections = {
    region: 'US',
    storeType: 'new',
    handlesTaxRush: false,
    hasOtherIncome: false,
  };

  constructor(private readonly bidir: BiDirService) {}

  get answers(): WizardAnswers {
    return this._answers$.getValue();
  }

  getSelections(): WizardSelections {
    return { ...this.selections };
  }

  updateSelections(update: Partial<WizardSelections>): void {
    this.selections = { ...this.selections, ...update };
  }

  updateAnswers(updates: Partial<WizardAnswers>): void {
    const current = this.answers;
    const next = { ...current, ...updates };

    // Handle bidirectional discount calculation
    if ('discountsAmt' in updates && current.projectedGrossFees) {
      const resolved = this.bidir.resolveLastEdited(
        'amount',
        current.projectedGrossFees,
        updates.discountsAmt,
        current.discountsPct
      );
      next.discountsAmt = resolved.amount;
      next.discountsPct = resolved.pct * 100; // Convert to percentage
    } else if ('discountsPct' in updates && current.projectedGrossFees) {
      const resolved = this.bidir.resolveLastEdited(
        'pct',
        current.projectedGrossFees,
        current.discountsAmt,
        (updates.discountsPct || 0) / 100 // Convert from percentage
      );
      next.discountsAmt = resolved.amount;
      next.discountsPct = resolved.pct * 100;
    }

    // Auto-calculate derived values
    this.calculateDerivedValues(next);

    this._answers$.next(next);
    this.saveToStorage(next);
  }

  private calculateDerivedValues(answers: WizardAnswers): void {
    // Calculate projected gross fees
    if (answers.projectedTaxPrepReturns && answers.avgNetFee) {
      answers.projectedGrossFees = answers.projectedTaxPrepReturns * answers.avgNetFee;
    }

    // Calculate discounts if not manually set
    if (answers.projectedGrossFees && answers.discountsPct && !answers.discountsAmt) {
      answers.discountsAmt = answers.projectedGrossFees * (answers.discountsPct / 100);
    }

    // Calculate projected tax prep income
    if (answers.projectedGrossFees && answers.discountsAmt !== undefined) {
      answers.projectedTaxPrepIncome = answers.projectedGrossFees - answers.discountsAmt;
    }

    // Calculate total expenses (auto: 76% of total income)
    if (answers.projectedTaxPrepIncome && !answers.calculatedTotalExpenses) {
      const totalIncome = (answers.projectedTaxPrepIncome || 0) + (answers.otherIncome || 0);
      answers.projectedExpenses = Math.round(totalIncome * 0.76);
    }
  }

  private loadFromStorage(): WizardAnswers {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load wizard state from storage:', error);
    }

    // Return default state
    return {
      region: 'US',
      storeType: 'new',
      handlesTaxRush: false,
      hasOtherIncome: false,
      discountsPct: 3.0, // Default 3%
      avgNetFee: 125, // Default values
      taxPrepReturns: 1600,
    };
  }

  private saveToStorage(answers: WizardAnswers): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.warn('Failed to save wizard state to storage:', error);
    }
  }

  resetAnswers(): void {
    const defaultAnswers = this.loadFromStorage();
    this._answers$.next(defaultAnswers);
    localStorage.removeItem(STORAGE_KEY);
  }
}
