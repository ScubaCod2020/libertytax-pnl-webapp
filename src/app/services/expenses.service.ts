import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ExpensesState {
  salariesPct: number | undefined;
  empDeductionsPct: number | undefined;
  rentPct: number | undefined;
  telephoneAmt: number | undefined;
  utilitiesAmt: number | undefined;
  localAdvAmt: number | undefined;
  insuranceAmt: number | undefined;
  postageAmt: number | undefined;
  suppliesPct: number | undefined;
  duesAmt: number | undefined;
  bankFeesAmt: number | undefined;
  maintenanceAmt: number | undefined;
  travelEntAmt: number | undefined;
  royaltiesPct: number | undefined;
  advRoyaltiesPct: number | undefined;
  taxRushRoyaltiesPct: number | undefined;
  miscPct: number | undefined;
}

const DEFAULTS: ExpensesState = {
  salariesPct: 25,
  empDeductionsPct: 10,
  rentPct: 18,
  telephoneAmt: 200,
  utilitiesAmt: 300,
  localAdvAmt: 500,
  insuranceAmt: 150,
  postageAmt: 100,
  suppliesPct: 3.5,
  duesAmt: 200,
  bankFeesAmt: 100,
  maintenanceAmt: 150,
  travelEntAmt: 200,
  royaltiesPct: 14,
  advRoyaltiesPct: 5,
  taxRushRoyaltiesPct: 0,
  miscPct: 2.5,
};

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private readonly _state$ = new BehaviorSubject<ExpensesState>(DEFAULTS);
  readonly state$ = this._state$.asObservable();

  get state(): ExpensesState {
    return this._state$.getValue();
  }
  set(partial: Partial<ExpensesState>) {
    this._state$.next({ ...this.state, ...partial });
  }
  reset() {
    this._state$.next(DEFAULTS);
  }
}
