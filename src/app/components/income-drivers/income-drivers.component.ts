import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { combineLatest, debounceTime, startWith, Subscription } from 'rxjs';
import {
  calculateDiscountAmount,
  calculateGrossTaxPrepFees,
  calculateLastYearRevenue,
  calculateTaxPrepIncome,
  calculateTaxRushGrossFees,
  calculateTaxRushReturnsPct,
  calculateTotalExpensesFromGross,
} from '../../existing-store/shared/calc.util';
import { FieldKey, FieldSpec, FIELDS } from '../../existing-store/shared/fields.dictionary';
import { GoalsSchemaEntry, Mode, schemaFor } from '../../existing-store/income-drivers/goals.config';
import { PriorYearMetrics } from '../../existing-store/shared/prior-year.models';

interface FormStatePayload {
  value: Record<string, unknown>;
  valid: boolean;
  touched: boolean;
}

type DerivationFn = (inputs: Partial<Record<FieldKey, number>>) => number;

@Component({
  selector: 'app-income-drivers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="income-drivers" *ngIf="form">
      <header class="income-drivers__header">
        <h3>{{ displayTitle || 'Income Drivers' }}</h3>
      </header>

      <form [formGroup]="form" class="income-drivers__form">
        <ng-container *ngFor="let field of visibleFields">
          <div class="income-drivers__field" [class.readonly]="form.get(field.key)?.disabled">
            <label [attr.for]="field.key" class="income-drivers__label">
              <span class="income-drivers__label-text">
                {{ field.label }}
                <span *ngIf="field.unit" class="income-drivers__unit">({{ field.unit }})</span>
              </span>
              <span *ngIf="isRequired(field)" class="income-drivers__required">*</span>
            </label>

            <ng-container [ngSwitch]="field.type">
              <input
                *ngSwitchCase="'money'"
                type="number"
                class="income-drivers__input"
                [formControlName]="field.key"
                [attr.id]="field.key"
                [attr.step]="field.validators?.step ?? 1"
                [attr.min]="field.validators?.min"
                [attr.max]="field.validators?.max"
                [attr.placeholder]="field.unit === '$' ? '0.00' : ''"
              />

              <input
                *ngSwitchCase="'percent'"
                type="number"
                class="income-drivers__input"
                [formControlName]="field.key"
                [attr.id]="field.key"
                [attr.step]="field.validators?.step ?? 0.1"
                [attr.min]="field.validators?.min"
                [attr.max]="field.validators?.max"
              />

              <input
                *ngSwitchCase="'number'"
                type="number"
                class="income-drivers__input"
                [formControlName]="field.key"
                [attr.id]="field.key"
                [attr.step]="field.validators?.step ?? 1"
                [attr.min]="field.validators?.min"
                [attr.max]="field.validators?.max"
              />

              <input
                *ngSwitchCase="'text'"
                type="text"
                class="income-drivers__input"
                [formControlName]="field.key"
                [attr.id]="field.key"
              />

              <input
                *ngSwitchCase="'boolean'"
                type="checkbox"
                class="income-drivers__checkbox"
                [formControlName]="field.key"
                [attr.id]="field.key"
              />
            </ng-container>

            <small class="income-drivers__help" *ngIf="field.help">{{ field.help }}</small>
            <small class="income-drivers__error" *ngIf="showError(field.key)">
              Invalid value
            </small>
          </div>
        </ng-container>
      </form>
    </section>
  `,
  styles: [
    `
      .income-drivers {
        display: block;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: #ffffff;
      }
      .income-drivers__header {
        margin-bottom: 1rem;
      }
      .income-drivers__form {
        display: grid;
        gap: 1rem;
      }
      .income-drivers__field {
        display: grid;
        gap: 0.35rem;
      }
      .income-drivers__field.readonly .income-drivers__input {
        background: #f5f5f5;
      }
      .income-drivers__label {
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .income-drivers__label-text {
        display: flex;
        align-items: baseline;
        gap: 0.35rem;
      }

      .income-drivers__unit {
        font-weight: 400;
        color: #6b7280;
        font-size: 0.85rem;
      }
      .income-drivers__required {
        color: #b91c1c;
        margin-left: 0.25rem;
      }
      .income-drivers__input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
      }
      .income-drivers__checkbox {
        width: 1rem;
        height: 1rem;
      }
      .income-drivers__help {
        color: #6b7280;
        font-size: 0.75rem;
      }
      .income-drivers__error {
        color: #b91c1c;
        font-size: 0.75rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeDriversComponent implements OnChanges, OnDestroy {
  @Input() mode: Mode = 'new';
  @Input() region!: string;
  @Input() storeType!: string;
  @Input() priorYear?: PriorYearMetrics;
  @Input() displayTitle = 'Income Drivers';

  @Output() formState = new EventEmitter<FormStatePayload>();

  form?: FormGroup;
  visibleFields: FieldSpec[] = [];

  private schema?: GoalsSchemaEntry;
  private valueSub?: Subscription;
  private statusSub?: Subscription;
  private derivedSubs: Subscription[] = [];

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    const shouldRebuild =
      !this.form ||
      changes['mode'] ||
      changes['region'] ||
      changes['storeType'];

    if (shouldRebuild && this.region && this.storeType) {
      this.buildForm();
    } else if (changes['priorYear'] && this.form) {
      this.applyPriorYear();
    }
  }

  ngOnDestroy(): void {
    this.teardownSubscriptions();
  }

  private buildForm(): void {
    this.schema = schemaFor(this.mode ?? 'new', this.region, this.storeType);
    this.visibleFields = this.schema.fields.map(field => FIELDS[field]).filter(Boolean);

    const controlsConfig: Record<string, FormControl> = {};
    const previousValues = this.form?.getRawValue() ?? {};

    for (const field of this.schema.fields) {
      const spec = FIELDS[field];
      if (!spec) {
        continue;
      }

      const validators = this.toValidators(spec.validators);
      const initial = this.resolveInitialValue(field, spec, previousValues);
      const control = this.fb.control(initial, validators);

      if (spec.deriveFrom?.length) {
        control.disable({ emitEvent: false });
      }

      controlsConfig[field] = control;
    }

    this.teardownSubscriptions();
    this.form = this.fb.group(controlsConfig);
    this.applyPriorYear();
    this.setupDerivedCalculations();
    this.subscribeToFormState();
    this.emitFormState();
  }

  private applyPriorYear(): void {
    if (!this.form || !this.priorYear) {
      return;
    }

    const mapping: Partial<Record<FieldKey, keyof PriorYearMetrics>> = {
      lastYearGrossFees: 'grossFees',
      lastYearExpenses: 'expenses',
      lastYearReturns: 'taxPrepReturns',
      lastYearRevenue: 'revenue',
      taxRushReturns: 'taxRushReturns',
      grossTaxRushFees: 'taxRushGrossFees',
    };

    Object.entries(mapping).forEach(([fieldKey, priorKey]) => {
      const control = this.form?.get(fieldKey);
      if (!control || priorKey === undefined) {
        return;
      }

      const value = this.priorYear?.[priorKey];
      if (value !== undefined && value !== null) {
        control.setValue(value, { emitEvent: false });
      }
    });
  }

  private resolveInitialValue(
    field: FieldKey,
    spec: FieldSpec,
    previousValues: Record<string, unknown>
  ): unknown {
    if (previousValues && previousValues[field] !== undefined) {
      return previousValues[field];
    }

    if (spec.type === 'boolean') {
      return false;
    }

    if (field === 'discountsPct') {
      return 3; // default discount baseline when not provided
    }

    return null;
  }

  private setupDerivedCalculations(): void {
    if (!this.form || !this.schema) {
      return;
    }

    for (const field of this.schema.fields) {
      const spec = FIELDS[field];
      if (!spec?.deriveFrom?.length) {
        continue;
      }

      const derivation = this.getDerivation(field);
      if (!derivation) {
        continue;
      }

      const controls = spec.deriveFrom
        .map(dep => this.form?.get(dep))
        .filter((ctrl): ctrl is FormControl => !!ctrl);

      if (!controls.length) {
        continue;
      }

      const sub = combineLatest(
        controls.map(control => control.valueChanges.pipe(startWith(control.value ?? 0)))
      )
        .pipe(debounceTime(75))
        .subscribe(values => {
          const inputs: Partial<Record<FieldKey, number>> = {};
          spec.deriveFrom!.forEach((dep, idx) => {
            inputs[dep] = Number(values[idx]) || 0;
          });

          const nextValue = derivation(inputs);
          const target = this.form?.get(field);
          if (target) {
            target.setValue(nextValue, { emitEvent: false });
          }
        });

      this.derivedSubs.push(sub);

      const initialInputs: Partial<Record<FieldKey, number>> = {};
      spec.deriveFrom.forEach(dep => {
        initialInputs[dep] = Number(this.form?.get(dep)?.value) || 0;
      });
      const initial = derivation(initialInputs);
      const target = this.form.get(field);
      if (target) {
        target.setValue(initial, { emitEvent: false });
      }
    }
  }

  private subscribeToFormState(): void {
    if (!this.form) {
      return;
    }

    this.valueSub = this.form.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      this.emitFormState();
    });

    this.statusSub = this.form.statusChanges.subscribe(() => {
      this.emitFormState();
    });
  }

  private emitFormState(): void {
    if (!this.form) {
      return;
    }

    const payload: FormStatePayload = {
      value: this.form.getRawValue(),
      valid: this.form.valid,
      touched: this.isFormTouched(this.form),
    };

    this.formState.emit(payload);
  }

  private teardownSubscriptions(): void {
    this.valueSub?.unsubscribe();
    this.statusSub?.unsubscribe();
    this.derivedSubs.forEach(sub => sub.unsubscribe());
    this.derivedSubs = [];
  }

  private toValidators(config?: FieldSpec['validators']): ValidatorFn[] {
    if (!config) {
      return [];
    }

    const validators: ValidatorFn[] = [];

    if (config.required) {
      validators.push(Validators.required);
    }
    if (config.min !== undefined) {
      validators.push(Validators.min(config.min));
    }
    if (config.max !== undefined) {
      validators.push(Validators.max(config.max));
    }
    if (config.pattern) {
      validators.push(Validators.pattern(config.pattern));
    }

    return validators;
  }

  private getDerivation(field: FieldKey): DerivationFn | undefined {
    switch (field) {
      case 'grossTaxPrepFees':
        return inputs => calculateGrossTaxPrepFees(inputs.avgNetFee ?? 0, inputs.taxPrepReturns ?? 0);
      case 'discountsAmt':
        return inputs => calculateDiscountAmount(inputs.grossTaxPrepFees ?? 0, inputs.discountsPct ?? 0);
      case 'netTaxPrepFees':
        return inputs => calculateTaxPrepIncome(inputs.grossTaxPrepFees ?? 0, inputs.discountsAmt ?? 0);
      case 'grossTaxRushFees':
        return inputs =>
          calculateTaxRushGrossFees(
            inputs.taxRushReturns ?? 0,
            inputs.taxRushFee,
            inputs.grossTaxPrepFees,
            inputs.taxPrepReturns
          );
      case 'totalExpenses':
        return inputs => calculateTotalExpensesFromGross(inputs.grossTaxPrepFees ?? 0);
      case 'taxRushPercentage':
        return inputs => calculateTaxRushReturnsPct(inputs.taxRushReturns ?? 0, inputs.taxPrepReturns ?? 0);
      case 'lastYearRevenue':
        return inputs =>
          calculateLastYearRevenue(
            inputs.lastYearGrossFees ?? 0,
            this.priorYear?.discountAmount ?? 0,
            this.priorYear?.otherIncome ?? 0
          );
      default:
        return undefined;
    }
  }

  private isRequired(field: FieldSpec): boolean {
    return !!field.validators?.required;
  }

  private showError(fieldKey: string): boolean {
    if (!this.form) {
      return false;
    }

    const control = this.form.get(fieldKey);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private isFormTouched(group: FormGroup): boolean {
    return Object.values(group.controls).some(control => control.touched || control.dirty);
  }
}
