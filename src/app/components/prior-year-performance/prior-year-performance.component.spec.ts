// prior-year-performance.component.spec.ts - Unit tests for PriorYearPerformanceComponent
// Tests form validation, calculations, and emissions

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PriorYearPerformanceComponent, PriorYearData, PriorYearMetrics } from './prior-year-performance.component';

describe('PriorYearPerformanceComponent', () => {
  let component: PriorYearPerformanceComponent;
  let fixture: ComponentFixture<PriorYearPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, PriorYearPerformanceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PriorYearPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.priorYearForm).toBeDefined();
    expect(component.priorYearForm.get('grossFees')?.value).toBeNull();
    expect(component.priorYearForm.get('expenses')?.value).toBeNull();
  });

  it('should calculate metrics correctly when form values change', (done) => {
    // Subscribe to metrics changes
    component.metricsChange.subscribe((metrics: PriorYearMetrics) => {
      expect(metrics.taxPrepIncome).toBe(194000); // 200000 - 6000
      expect(metrics.totalRevenue).toBe(199000);  // 194000 + 5000 + 0
      expect(metrics.netIncome).toBe(52000);      // 199000 - 147000
      expect(metrics.discountsPct).toBe(3);       // (6000 / 200000) * 100
      done();
    });

    // Set form values
    component.priorYearForm.patchValue({
      grossFees: 200000,
      discountsAmt: 6000,
      taxPrepReturns: 1600,
      otherIncome: 5000,
      expenses: 147000
    });
  });

  it('should emit data changes with correct structure', (done) => {
    // Subscribe to data changes
    component.dataChange.subscribe((data: PriorYearData) => {
      expect(data.lastYearGrossFees).toBe(200000);
      expect(data.lastYearDiscountsAmt).toBe(6000);
      expect(data.lastYearTaxPrepReturns).toBe(1600);
      expect(data.lastYearExpenses).toBe(147000);
      expect(data.lastYearDiscountsPct).toBe(3);
      done();
    });

    // Set form values
    component.priorYearForm.patchValue({
      grossFees: 200000,
      discountsAmt: 6000,
      taxPrepReturns: 1600,
      expenses: 147000
    });
  });

  it('should show TaxRush fields for Canada region', () => {
    component.region = 'CA';
    fixture.detectChanges();

    const taxRushSection = fixture.nativeElement.querySelector('.taxrush-section');
    expect(taxRushSection).toBeTruthy();
  });

  it('should hide TaxRush fields for US region', () => {
    component.region = 'US';
    fixture.detectChanges();

    const taxRushSection = fixture.nativeElement.querySelector('.taxrush-section');
    expect(taxRushSection).toBeFalsy();
  });

  it('should calculate TaxRush income for CA region', (done) => {
    component.region = 'CA';
    
    component.metricsChange.subscribe((metrics: PriorYearMetrics) => {
      expect(metrics.taxRushIncome).toBe(12000); // 240 returns * $50 avg fee
      expect(metrics.totalRevenue).toBe(206000); // 194000 + 0 + 12000
      done();
    });

    // Set form values including TaxRush
    component.priorYearForm.patchValue({
      grossFees: 200000,
      discountsAmt: 6000,
      taxRushReturns: 240,
      taxRushAvgNetFee: 50
    });
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(0)).toBe('$0');
    expect(component.formatCurrency(1000)).toBe('$1,000');
    expect(component.formatCurrency(200000)).toBe('$200,000');
  });

  it('should determine net income class correctly', () => {
    component.metrics = { ...component.metrics, netIncome: 50000 };
    expect(component.getNetIncomeClass()).toBe('positive');

    component.metrics = { ...component.metrics, netIncome: -10000 };
    expect(component.getNetIncomeClass()).toBe('negative');

    component.metrics = { ...component.metrics, netIncome: 0 };
    expect(component.getNetIncomeClass()).toBe('neutral');
  });

  it('should show data as complete when required fields are filled', () => {
    component.priorYearForm.patchValue({
      grossFees: 200000,
      taxPrepReturns: 1600,
      expenses: 147000
    });

    expect(component.isDataComplete).toBe(true);
  });

  it('should show data as incomplete when required fields are missing', () => {
    component.priorYearForm.patchValue({
      grossFees: 200000,
      // missing taxPrepReturns and expenses
    });

    expect(component.isDataComplete).toBe(false);
  });

  it('should initialize with provided data', () => {
    const initialData: Partial<PriorYearData> = {
      lastYearGrossFees: 150000,
      lastYearDiscountsAmt: 4500,
      lastYearTaxPrepReturns: 1200,
      lastYearExpenses: 120000
    };

    component.initialData = initialData;
    component.ngOnInit();

    expect(component.priorYearForm.get('grossFees')?.value).toBe(150000);
    expect(component.priorYearForm.get('discountsAmt')?.value).toBe(4500);
    expect(component.priorYearForm.get('taxPrepReturns')?.value).toBe(1200);
    expect(component.priorYearForm.get('expenses')?.value).toBe(120000);
  });
});
