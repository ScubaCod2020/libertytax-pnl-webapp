import { Injectable } from '@angular/core';
import { ExpensesModel, TARGET_TOTAL_PCT } from '../../contracts/expenses/expenses.contract';

@Injectable({ providedIn: 'root' })
export class RentGuardService {
  raiseToLocalIfBelow(currentRent: number, localMin: number): number {
    return Math.max(currentRent, localMin);
  }
  anchoredResetKeepRent(
    exp: ExpensesModel,
    categoryForRent: 'facility' = 'facility'
  ): ExpensesModel {
    // TODO: redistribute non-rent categories to hit TARGET_TOTAL_PCT; do not mutate input.
    return { ...exp };
  }
  targetTotal(): number {
    return TARGET_TOTAL_PCT;
  }
}
