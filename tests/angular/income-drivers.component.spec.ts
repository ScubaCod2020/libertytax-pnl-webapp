import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeDriversComponent } from '../../src/app/components/income-drivers/income-drivers.component';

describe('IncomeDriversComponent', () => {
  let component: IncomeDriversComponent;
  let fixture: ComponentFixture<IncomeDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeDriversComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('applies +2% to both scopes when both checked', () => {
    component.incomeForm.get('taxPrepReturns')?.setValue(1000);
    component.incomeForm.get('avgNetFee')?.setValue(100);
    component.applyToReturns = true;
    component.applyToAvgFee = true;
    component.applyPreset(2);

    expect(component.incomeForm.get('taxPrepReturns')?.value).toBe(1020);
    expect(component.incomeForm.get('avgNetFee')?.value).toBe(102);
  });

  it('only Returns scope leaves fee unchanged', () => {
    component.incomeForm.get('taxPrepReturns')?.setValue(1000);
    component.incomeForm.get('avgNetFee')?.setValue(100);
    component.applyToReturns = true;
    component.applyToAvgFee = false;
    component.applyPreset(5);

    expect(component.incomeForm.get('taxPrepReturns')?.value).toBe(1050);
    expect(component.incomeForm.get('avgNetFee')?.value).toBe(100);
  });

  it('title matches context', () => {
    component.context = 'new';
    expect(component.titleText).toBe('Target Performance');
    component.context = 'existing';
    expect(component.titleText).toBe('Projected Performance');
    component.context = 'generic';
    expect(component.titleText).toBe('Income Drivers');
  });
});


