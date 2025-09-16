import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { normalizePriorYearMetrics } from '../../existing-store/shared/calc.util';
import { FieldKey, FIELDS } from '../../existing-store/shared/fields.dictionary';
import { PriorYearMetrics, PriorYearRawMetrics } from '../../existing-store/shared/prior-year.models';

type PriorYearControl = keyof PriorYearRawMetrics;

interface PriorYearInputConfig {
  control: PriorYearControl;
  fieldKey: FieldKey;
}

interface PriorYearSummaryConfig {
  fieldKey: FieldKey;
  valueKey: keyof PriorYearMetrics;
  digitsInfo: string;
}

@Component({
  selector: 'app-prior-year-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="prior-year" [formGroup]="form">
      <header class="prior-year__header">
        <h3>Prior Year Performance</h3>
      </header>

      <div class="prior-year__grid">
        <div class="prior-year__inputs">
          <div class="prior-year__field" *ngFor="let input of inputFields">
            <label class="prior-year__label" [attr.for]="input.control">
              {{ fields[input.fieldKey].label }}
              <span *ngIf="fields[input.fieldKey].unit" class="prior-year__unit">
                ({{ fields[input.fieldKey].unit }})
              </span>
            </label>

            <input
              type="number"
              class="prior-year__input"
              [formControlName]="input.control"
              [attr.id]="input.control"
              [attr.step]="getStep(input.fieldKey)"
              [attr.min]="getMin(input.fieldKey)"
              [attr.max]="getMax(input.fieldKey)"
              [attr.placeholder]="getPlaceholder(input.fieldKey)"
            />
          </div>
        </div>

        <div class="prior-year__summary">
          <div class="prior-year__metric" *ngFor="let summary of summaryMetrics">
            <span class="prior-year__metric-label">
              {{ fields[summary.fieldKey].label }}
            </span>
            <span class="prior-year__metric-value">
              <ng-container [ngSwitch]="fields[summary.fieldKey].unit">
                <ng-container *ngSwitchCase="'$'">
                  {{ '$' }}{{ metrics[summary.valueKey] | number: summary.digitsInfo }}
                </ng-container>
                <ng-container *ngSwitchCase="'%'">
                  {{ metrics[summary.valueKey] | number: summary.digitsInfo }}%
                </ng-container>
                <ng-container *ngSwitchDefault>
                  {{ metrics[summary.valueKey] | number: summary.digitsInfo }}
                </ng-container>
              </ng-container>
            </span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .prior-year {
        display: block;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        background-color: #ffffff;
      }

      .prior-year__header {
        margin-bottom: 1rem;
      }

      .prior-year__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
      }

      .prior-year__inputs {
        display: grid;
        gap: 0.75rem;
      }

      .prior-year__field {
        display: grid;
        gap: 0.35rem;
      }

      .prior-year__label {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-weight: 600;
        color: #1f2937;
      }

      .prior-year__unit {
        font-weight: 400;
        color: #6b7280;
        font-size: 0.85rem;
      }

      .prior-year__input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
      }

      .prior-year__summary {
        display: grid;
        gap: 0.75rem;
        align-content: start;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1rem;
      }

      .prior-year__metric {
        display: flex;
        justify-content: space-between;
        font-size: 0.95rem;
      }

      .prior-year__metric-label {
        color: #4b5563;
      }

      .prior-year__metric-value {
        font-weight: 600;
        color: #111827;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorYearPerformanceComponent implements OnInit, OnChanges, OnDestroy {
  @Input() region!: string;
  @Input() storeType!: string;
  @Input() raw: PriorYearRawMetrics = {};

  @Output() metricsChange = new EventEmitter<PriorYearMetrics>();

  readonly fields = FIELDS;

  readonly inputFields: PriorYearInputConfig[] = [
    { control: 'grossFees', fieldKey: 'lastYearGrossFees' },
    { control: 'discountAmount', fieldKey: 'discountsAmt' },
    { control: 'otherIncome', fieldKey: 'otherIncome' },
    { control: 'expenses', fieldKey: 'lastYearExpenses' },
    { control: 'taxPrepReturns', fieldKey: 'taxPrepReturns' },
    { control: 'taxRushReturns', fieldKey: 'taxRushReturns' },
    { control: 'taxRushAvgNetFee', fieldKey: 'taxRushFee' },
  ];

  readonly summaryMetrics: PriorYearSummaryConfig[] = [
    { fieldKey: 'discountsPct', valueKey: 'discountPct', digitsInfo: '1.0-1' },
    { fieldKey: 'avgNetFee', valueKey: 'avgNetFee', digitsInfo: '1.0-2' },
    { fieldKey: 'netTaxPrepFees', valueKey: 'taxPrepIncome', digitsInfo: '1.0-2' },
    { fieldKey: 'grossTaxRushFees', valueKey: 'taxRushGrossFees', digitsInfo: '1.0-2' },
    { fieldKey: 'lastYearRevenue', valueKey: 'revenue', digitsInfo: '1.0-2' },
    { fieldKey: 'netIncome', valueKey: 'netIncome', digitsInfo: '1.0-2' },
  ];

  form!: FormGroup;
  metrics: PriorYearMetrics = normalizePriorYearMetrics({});

  private valueSub?: Subscription;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['raw'] && this.form) {
      this.form.patchValue(this.raw ?? {}, { emitEvent: false });
      this.metrics = normalizePriorYearMetrics(this.form.getRawValue());
      this.metricsChange.emit(this.metrics);
    }
  }

  ngOnDestroy(): void {
    this.valueSub?.unsubscribe();
  }

  getStep(fieldKey: FieldKey): number | null {
    return this.fields[fieldKey].validators?.step ?? null;
  }

  getMin(fieldKey: FieldKey): number | null {
    return this.fields[fieldKey].validators?.min ?? null;
  }

  getMax(fieldKey: FieldKey): number | null {
    return this.fields[fieldKey].validators?.max ?? null;
  }

  getPlaceholder(fieldKey: FieldKey): string | null {
    const spec = this.fields[fieldKey];
    if (spec.unit === '$') {
      return '0.00';
    }
    if (spec.unit === '%') {
      return '0.0';
    }
    return null;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      grossFees: [this.raw?.grossFees ?? null, [Validators.min(0)]],
      discountAmount: [this.raw?.discountAmount ?? null, [Validators.min(0)]],
      otherIncome: [this.raw?.otherIncome ?? null, [Validators.min(0)]],
      expenses: [this.raw?.expenses ?? null, [Validators.min(0)]],
      taxPrepReturns: [this.raw?.taxPrepReturns ?? null, [Validators.min(0)]],
      taxRushReturns: [this.raw?.taxRushReturns ?? null, [Validators.min(0)]],
      taxRushAvgNetFee: [this.raw?.taxRushAvgNetFee ?? null, [Validators.min(0)]],
    });

    this.metrics = normalizePriorYearMetrics(this.form.getRawValue());
    this.metricsChange.emit(this.metrics);

    this.valueSub = this.form.valueChanges.pipe(debounceTime(100)).subscribe(value => {
      this.metrics = normalizePriorYearMetrics(value as PriorYearRawMetrics);
      this.metricsChange.emit(this.metrics);
    });
  }
}
