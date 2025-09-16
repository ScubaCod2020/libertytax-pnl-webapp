import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PriorYearMetrics } from '../prior-year-performance/prior-year-performance.component';
import { schemaFor, type GoalsSchemaEntry, type Mode } from '../../existing-store/income-drivers/goals.config';
import { FIELDS, type FieldKey, type FieldSpec } from '../../existing-store/shared/fields.dictionary';
import * as Calc from '../../existing-store/shared/calc.util';

const DEFAULT_FIELD_VALUES: Partial<Record<FieldKey, number>> = {
  avgNetFee: 0,
  taxPrepReturns: 0,
  grossTaxPrepFees: 0,
  discountsPct: 0,
  discountsAmt: 0,
  netTaxPrepIncome: 0,
  taxRushReturns: 0,
  taxRushPercentage: 0,
  taxRushFee: 0,
  taxRushIncome: 0,
  otherIncome: 0,
  totalRevenue: 0
};

@Component({
  selector: 'app-income-drivers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="income-drivers">
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">{{ displayTitle || 'Income Drivers' }}</h2>
        <small class="opacity-70">{{ mode | uppercase }} • {{ region }} • {{ storeType }}</small>
      </header>

      <form [formGroup]="form" class="grid gap-3">
        <!-- Render controls from the active schema -->
        <ng-container *ngFor="let key of visibleKeys">
          <label class="flex flex-col gap-1">
            <span class="text-sm">
              {{ fieldSpec(key).label }}
              <ng-container *ngIf="fieldSpec(key).unit">({{ fieldSpec(key).unit }})</ng-container>
            </span>

            <input
              class="border rounded p-2"
              [attr.inputmode]="fieldSpec(key).type === 'number' || fieldSpec(key).type === 'money' || fieldSpec(key).type === 'percent' ? 'decimal' : 'text'"
              [readonly]="isDerived(key)"
              [formControlName]="key" />

            <em class="text-xs opacity-70" *ngIf="fieldSpec(key).help">
              {{ fieldSpec(key).help }}
            </em>

            <span class="text-xs text-red-600" *ngIf="form.get(key)?.invalid && (form.get(key)?.touched || form.get(key)?.dirty)">
              Invalid value
            </span>
          </label>
        </ng-container>
      </form>
    </section>
  `
})
export class IncomeDriversComponent implements OnChanges, OnDestroy {
  private fb = inject(FormBuilder);

  // Inputs selected by the parent shell
  @Input() mode: Mode = 'new';
  @Input() region!: string;
  @Input() storeType!: string;
  @Input() priorYear?: PriorYearMetrics;
  @Input() displayTitle?: string;

  // Emit a simple form state snapshot upward
  @Output() formState = new EventEmitter<{ value: any; valid: boolean; touched: boolean }>();

  form: FormGroup = this.fb.group({});
  private currentSchema: GoalsSchemaEntry | null = null;
  private valueChangesSub?: Subscription;

  // Cache of visible keys from the schema (order preserved)
  visibleKeys: FieldKey[] = [];

  ngOnChanges(_changes: SimpleChanges): void {
    // Rebuild schema & form whenever the scenario changes
    this.currentSchema = schemaFor(this.mode, this.region, this.storeType);
    this.visibleKeys = [...(this.currentSchema?.fields ?? [])];

    this.rebuildForm();

    // Recompute derived fields once at scenario change (from priorYear if present)
    this.applyDerivedFromPriorYear();
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  /** Build Reactive Form controls from dictionary + schema */
  private rebuildForm(): void {
    const group: Record<string, any> = {};

    for (const key of this.visibleKeys) {
      const spec = FIELDS[key];
      const validators = this.toAngularValidators(spec);
      const initial = this.initialValueFor(key);
      group[key] = [{ value: initial, disabled: this.isDerived(key) }, validators];
    }

    this.form = this.fb.group(group);

    if (this.valueChangesSub) {
      this.valueChangesSub.unsubscribe();
    }

    this.valueChangesSub = this.form.valueChanges
      .pipe(
        debounceTime(120),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(() => {
        this.updateDerivedFields();
        this.emitState();
      });

    this.updateDerivedFields();
    this.emitState();
  }

  /** Convert our FieldSpec validators into Angular Validators[] */
  private toAngularValidators(spec: FieldSpec) {
    const v = spec.validators || {};
    const arr = [];
    if (v.required) arr.push(Validators.required);
    if (typeof v.min === 'number') arr.push(Validators.min(v.min));
    if (typeof v.max === 'number') arr.push(Validators.max(v.max));
    if (v.pattern) arr.push(Validators.pattern(v.pattern));
    // NOTE: step is a UI concern; consider custom validator if needed.
    return arr;
  }

  /** Seed initial value; can draw from priorYear for certain keys */
  private initialValueFor(key: FieldKey) {
    if (this.priorYear && key in this.priorYear) {
      const value = this.priorYear[key as keyof PriorYearMetrics];
      if (value !== undefined && value !== null) {
        return value;
      }
    }

    if (key in DEFAULT_FIELD_VALUES) {
      return DEFAULT_FIELD_VALUES[key as keyof typeof DEFAULT_FIELD_VALUES] ?? null;
    }

    return null;
  }

  /** Determine if a field is read-only derived */
  isDerived = (key: FieldKey) => {
    const spec = FIELDS[key];
    return !!spec.deriveFrom && spec.deriveFrom.length > 0;
  };

  /** Lookup FieldSpec quickly in template */
  fieldSpec = (key: FieldKey) => FIELDS[key];

  /** Compute all derived fields using calc.util and setValue without emitting loops */
  private updateDerivedFields(): void {
    if (!this.form) return;

    const derivedKeys = this.visibleKeys.filter(k => this.isDerived(k));
    const handlesTaxRush = this.visibleKeys.includes('taxRushReturns');

    for (const key of derivedKeys) {
      let computed: number | null = null;

      switch (key) {
        case 'grossTaxPrepFees': {
          computed = Calc.calculateGrossTaxPrepFees(
            this.form.get('avgNetFee')?.value,
            this.form.get('taxPrepReturns')?.value,
            this.form.get('taxRushReturns')?.value,
            { region: this.region, handlesTaxRush }
          );
          break;
        }
        case 'discountsAmt': {
          computed = Calc.calculateDiscountAmount(
            this.form.get('grossTaxPrepFees')?.value,
            this.form.get('discountsPct')?.value
          );
          break;
        }
        case 'netTaxPrepIncome': {
          computed = Calc.calculateNetTaxPrepIncome(
            this.form.get('grossTaxPrepFees')?.value,
            this.form.get('discountsAmt')?.value
          );
          break;
        }
        case 'taxRushPercentage': {
          computed = Calc.calculateTaxRushPercentage(
            this.form.get('taxPrepReturns')?.value,
            this.form.get('taxRushReturns')?.value
          );
          break;
        }
        case 'taxRushIncome': {
          computed = Calc.calculateTaxRushIncome(
            this.form.get('taxRushReturns')?.value,
            this.form.get('taxRushFee')?.value
          );
          break;
        }
        case 'totalRevenue': {
          const netIncome = this.form.get('netTaxPrepIncome')?.value;
          const rushIncome = handlesTaxRush ? this.form.get('taxRushIncome')?.value : 0;
          const otherIncome = this.form.get('otherIncome')?.value;
          computed = Calc.calculateTotalRevenue(netIncome, rushIncome, otherIncome);
          break;
        }
      }

      if (computed === null || Number.isNaN(computed)) continue;

      const ctrl = this.form.get(key);
      if (ctrl) {
        ctrl.setValue(computed, { emitEvent: false });
      }
    }
  }

  /** Optional: initialize derived fields from priorYear snapshot */
  private applyDerivedFromPriorYear(): void {
    if (!this.priorYear) {
      this.updateDerivedFields();
      this.emitState();
      return;
    }

    for (const key of this.visibleKeys) {
      const ctrl = this.form.get(key);
      if (!ctrl) continue;

      const priorValue = this.priorYear[key as keyof PriorYearMetrics];
      if (priorValue !== undefined && priorValue !== null) {
        ctrl.setValue(priorValue, { emitEvent: false });
      }
    }

    this.updateDerivedFields();
    this.emitState();
  }

  private emitState(): void {
    this.formState.emit({
      value: this.form.getRawValue(),
      valid: this.form.valid,
      touched: this.form.touched
    });
  }
}
