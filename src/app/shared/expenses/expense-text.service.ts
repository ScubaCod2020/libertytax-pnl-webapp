import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { ExpenseKey } from './expenses.types';
import { WizardStateService } from '../../core/services/wizard-state.service';
import {
  ExpenseTextService as V1ExpenseTextService,
  buildAnfNote,
  buildAnfTooltip,
} from '../../domain/services/expense-text.service';
import type { WizardAnswers } from '../../domain/types/wizard.types';

@Injectable({ providedIn: 'root' })
export class SharedExpenseTextService {
  constructor(
    private readonly wizardState: WizardStateService,
    private readonly v1Text: V1ExpenseTextService
  ) {}

  /** Delegate to existing sync builders by key */
  getNoteFor(key: ExpenseKey, a: any): string {
    switch (key) {
      case 'telephone':
        return this.v1Text.getTelephoneNote(a);
      case 'utilities':
        return this.v1Text.getUtilitiesNote(a);
      case 'localAdv':
        return this.v1Text.getLocalAdvNote(a);
      case 'supplies':
        return this.v1Text.getSuppliesNote(a);
      case 'dues':
        return this.v1Text.getDuesNote(a);
      case 'bankFees':
        return this.v1Text.getBankFeesNote(a);
      case 'maintenance':
        return this.v1Text.getMaintenanceNote(a);
      case 'travel':
        return this.v1Text.getTravelNote(a);
      case 'insurance':
        return this.v1Text.getInsuranceNote(a);
      case 'misc':
        return this.v1Text.getMiscNote(a);
      default:
        return '';
    }
  }

  note$(key: ExpenseKey): Observable<string> {
    return this.wizardState.answers$.pipe(map((a) => this.getNoteFor(key, a)));
  }

  /** Tooltip builder; reuse same strings for now */
  getTooltipFor(key: ExpenseKey, a: any): string {
    return this.getNoteFor(key, a);
  }

  tooltip$(key: ExpenseKey): Observable<string> {
    return this.wizardState.answers$.pipe(map((a) => this.getTooltipFor(key, a)));
  }

  // ANF KPI observable helpers
  anfTooltip$(): Observable<string> {
    return this.wizardState.answers$.pipe(
      map((a: WizardAnswers) =>
        buildAnfTooltip(a, (this.v1Text as any).evaluator || (this.v1Text as any))
      )
    );
  }

  anfNote$(): Observable<string> {
    return this.wizardState.answers$.pipe(
      map((a: WizardAnswers) =>
        buildAnfNote(a, (this.v1Text as any).evaluator || (this.v1Text as any))
      )
    );
  }
}
