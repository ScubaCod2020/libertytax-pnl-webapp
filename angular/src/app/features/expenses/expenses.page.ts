import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpensesService } from '../../shared/expenses/expenses.service';
import { SharedExpenseTextService } from '../../shared/expenses/expense-text.service';
import type { ExpenseKey } from '../../shared/expenses/expenses.types';

interface ExpenseRowCfg {
  key: ExpenseKey;
  label: string;
  placeholderAmt?: number;
  placeholderPct?: number;
  slider?: { min: number; max: number; step: number };
}

@Component({
  selector: 'app-expenses-page',
  template: `
    <ng-template
      #expenseRowTmpl
      let-key="key"
      let-label="label"
      let-amount$="amount$"
      let-percent$="percent$"
      let-status$="status$"
      let-gross$="gross$"
      let-baseline$="baseline$"
      let-noteText$="noteText$"
      let-tooltip$="tooltip$"
      let-noteValue$="noteValue$"
      let-slider="slider"
      let-placeholderAmt="placeholderAmt"
      let-placeholderPct="placeholderPct"
    >
      <div class="grid-row multi expense-row">
        <label>{{ label }}</label>

        <div class="grid-field chain">
          <div class="inline amount" [ngClass]="status$ | async">
            <button
              type="button"
              class="info-btn"
              [attr.aria-label]="label + ' guidance'"
              [attr.title]="tooltip$ | async"
            >
              ℹ️
            </button>

            <span class="prefix">$</span>
            <input
              type="number"
              class="input xs"
              [ngModel]="amount$ | async"
              (ngModelChange)="onAmt(key, $event)"
              [attr.placeholder]="placeholderAmt ?? 1000"
            />
          </div>

          <div class="inline percent">
            <input
              type="number"
              class="input xs"
              [ngModel]="percent$ | async"
              (ngModelChange)="onPct(key, $event)"
              [attr.placeholder]="placeholderPct ?? 0.5"
            />
            <span class="suffix">%</span>
          </div>
        </div>

        <div class="slider">
          <input
            type="range"
            [min]="slider?.min ?? 0"
            [max]="slider?.max ?? 5"
            [step]="slider?.step ?? 0.1"
            [ngModel]="percent$ | async"
            (ngModelChange)="onPct(key, $event)"
            [attr.aria-label]="label + ' percentage slider'"
          />
        </div>

        <div class="small note">
          {{ (noteText$ | async) || '' }}
          <span class="green"> • Base: {{ gross$ | async | number: '1.0-0' }} (gross revenue)</span>
        </div>

        <div class="note-field" *ngIf="(status$ | async) !== 'green'">
          <textarea
            class="expense-note"
            placeholder="Add notes or justification"
            rows="3"
            [ngModel]="noteValue$ | async"
            (ngModelChange)="onNote(key, $event)"
          ></textarea>
        </div>
      </div>
    </ng-template>

    <ng-container
      *ngFor="let row of rows; trackBy: trackKey"
      [ngTemplateOutlet]="expenseRowTmpl"
      [ngTemplateOutletContext]="{
        key: row.key,
        label: row.label,
        amount$: expenses.amount$(row.key),
        percent$: expenses.percent$(row.key),
        status$: expenses.statusClass$(row.key),
        gross$: expenses.grossRevenue$,
        baseline$: expenses.baselineUSD$(row.key),
        noteText$: text.note$(row.key),
        tooltip$: text.tooltip$(row.key),
        noteValue$: expenses.noteValue$(row.key),
        slider: row.slider,
        placeholderAmt: row.placeholderAmt,
        placeholderPct: row.placeholderPct,
      }"
    ></ng-container>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ExpensesPageComponent {
  constructor(
    public readonly expenses: ExpensesService,
    public readonly text: SharedExpenseTextService
  ) {}

  rows: ExpenseRowCfg[] = [
    { key: 'payroll', label: 'Payroll', placeholderPct: 35, slider: { min: 0, max: 60, step: 1 } },
    {
      key: 'empDeductions',
      label: 'Employee Deductions',
      placeholderPct: 10,
      slider: { min: 0, max: 50, step: 1 },
    },
    { key: 'rent', label: 'Rent', slider: { min: 0, max: 40, step: 0.5 } },
    {
      key: 'telephone',
      label: 'Telephone',
      placeholderAmt: 1000,
      placeholderPct: 0.5,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'utilities',
      label: 'Utilities',
      placeholderAmt: 2400,
      placeholderPct: 1.2,
      slider: { min: 0, max: 10, step: 0.1 },
    },
    {
      key: 'localAdv',
      label: 'Local Advertising',
      placeholderAmt: 4000,
      placeholderPct: 2,
      slider: { min: 0, max: 15, step: 0.1 },
    },
    {
      key: 'insurance',
      label: 'Insurance',
      placeholderAmt: 1200,
      placeholderPct: 0.6,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'postage',
      label: 'Postage',
      placeholderAmt: 800,
      placeholderPct: 0.4,
      slider: { min: 0, max: 3, step: 0.1 },
    },
    {
      key: 'supplies',
      label: 'Office Supplies',
      placeholderPct: 3.5,
      slider: { min: 0, max: 10, step: 0.1 },
    },
    {
      key: 'dues',
      label: 'Dues',
      placeholderAmt: 1600,
      placeholderPct: 0.8,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'bankFees',
      label: 'Bank Fees',
      placeholderAmt: 1000,
      placeholderPct: 0.5,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      placeholderAmt: 2400,
      placeholderPct: 1.2,
      slider: { min: 0, max: 8, step: 0.1 },
    },
    {
      key: 'travel',
      label: 'Travel',
      placeholderAmt: 1800,
      placeholderPct: 0.9,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'royalties',
      label: 'Tax Prep Royalties',
      placeholderPct: 14,
      slider: { min: 0, max: 25, step: 0.1 },
    },
    {
      key: 'advRoyalties',
      label: 'Advertising Royalties',
      placeholderPct: 5,
      slider: { min: 0, max: 15, step: 0.1 },
    },
    {
      key: 'taxRushRoyalties',
      label: 'Tax Rush Royalties',
      placeholderPct: 6,
      slider: { min: 0, max: 15, step: 0.1 },
    },
    {
      key: 'shortages',
      label: 'Shortages',
      placeholderPct: 2,
      slider: { min: 0, max: 10, step: 0.1 },
    },
    {
      key: 'misc',
      label: 'Miscellaneous',
      placeholderPct: 1,
      slider: { min: 0, max: 10, step: 0.1 },
    },
  ];

  trackKey = (_: number, r: ExpenseRowCfg) => r.key;

  onAmt(key: ExpenseKey, v: any) {
    const value = v === '' || v === null || v === undefined ? null : +v;
    this.expenses.updateAmount(key, value);
  }

  onPct(key: ExpenseKey, v: any) {
    const value = v === '' || v === null || v === undefined ? null : +v;
    this.expenses.updatePercent(key, value);
  }

  onNote(key: ExpenseKey, v: string) {
    this.expenses.updateNote(key, v ?? '');
  }
}
