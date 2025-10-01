import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { ExpensesService } from '../expenses/expenses.service';
import { SharedExpenseTextService } from '../expenses/expense-text.service';
import type { ExpenseKey } from '../expenses/expenses.types';
import { DebugFlagsService } from './debug-flags.service';
import { EXPENSE_KEYS } from '../expenses/expense-metadata';
import { CommonModule } from '@angular/common';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { KpiEvaluatorService } from '../../domain/services/kpi-evaluator.service';

@Component({
  selector: 'app-debug-overlay',
  templateUrl: './debug-overlay.component.html',
  styleUrls: ['./debug-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class DebugOverlayComponent {
  private flags = inject(DebugFlagsService);
  private expenses = inject(ExpensesService);
  private text = inject(SharedExpenseTextService);
  private wizard = inject(WizardStateService);
  private evaluator = inject(KpiEvaluatorService);

  readonly show$ = this.flags.enabled$;

  readonly rows$ = combineLatest(
    (EXPENSE_KEYS as ExpenseKey[]).map((key) =>
      combineLatest({
        key: [key][0],
        amount: this.expenses.amount$(key),
        percent: this.expenses.percent$(key),
        status: this.expenses.statusClass$(key),
        baseline: this.expenses.baselineUSD$(key),
        tooltip: this.text.tooltip$(key),
      })
    )
  );

  // ANF row
  readonly anf$ = this.wizard.answers$.pipe(
    // map directly to display shape
    (source) => source.pipe()
  );

  // Helper getter to build ANF display model
  get anfDisplay() {
    const a = this.wizard.answers;
    const val = a.projectedAvgNetFee ?? a.avgNetFee ?? null;
    const status = this.evaluator.getAnfStatus(a);
    const d = this.evaluator.getAnfDescriptor(a);
    const ccy = d.region === 'CA' ? 'CAD' : 'USD';
    const fmt = (v: number) => v.toLocaleString(undefined, { style: 'currency', currency: ccy });
    const band = `${fmt(d.green.min)}–${fmt(d.green.max)}`;
    return { key: 'ANF', amount: val, status, region: d.region, band };
  }
}
