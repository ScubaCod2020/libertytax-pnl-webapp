import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ExpensesFormComponent } from './expenses.component';
import { SettingsService } from '../../../../services/settings.service';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { KpiEvaluatorService } from '../../../../domain/services/kpi-evaluator.service';
import { ExpenseTextService } from '../../../../domain/services/expense-text.service';
import { ExpensesService } from '../../../../shared/expenses/expenses.service';
import { SharedExpenseTextService } from '../../../../shared/expenses/expense-text.service';
import { DebugLogService } from '../../../../shared/debug/debug-log.service';

describe('ExpensesFormComponent seeding behavior', () => {
  let component: ExpensesFormComponent;
  let fixture: ComponentFixture<ExpensesFormComponent>;
  let wizardStateService: jasmine.SpyObj<WizardStateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const wizardStateSpy = jasmine.createSpyObj(
      'WizardStateService',
      [
        'shouldReseedExpenses',
        'resetExpenseDefaults',
        'markExpensesSeeded',
        'getComputedPropertiesSummary',
      ],
      {
        answers$: { pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }) },
      }
    );
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'], {
      url: '/wizard/expenses',
    });

    await TestBed.configureTestingModule({
      imports: [ExpensesFormComponent],
      providers: [
        {
          provide: SettingsService,
          useValue: jasmine.createSpyObj('SettingsService', ['getValue']),
        },
        { provide: WizardStateService, useValue: wizardStateSpy },
        {
          provide: KpiEvaluatorService,
          useValue: jasmine.createSpyObj('KpiEvaluatorService', ['evaluate']),
        },
        {
          provide: ExpenseTextService,
          useValue: jasmine.createSpyObj('ExpenseTextService', ['getText']),
        },
        {
          provide: ExpensesService,
          useValue: jasmine.createSpyObj('ExpensesService', ['getExpenses']),
        },
        {
          provide: SharedExpenseTextService,
          useValue: jasmine.createSpyObj('SharedExpenseTextService', ['getText']),
        },
        { provide: DebugLogService, useValue: jasmine.createSpyObj('DebugLogService', ['log']) },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesFormComponent);
    component = fixture.componentInstance;
    wizardStateService = TestBed.inject(WizardStateService) as jasmine.SpyObj<WizardStateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should not reseed expenses on navigation when already seeded', () => {
    // Arrange: Mock that expenses are already seeded
    wizardStateService.shouldReseedExpenses.and.returnValue(false);
    wizardStateService.resetExpenseDefaults.and.stub();
    wizardStateService.markExpensesSeeded.and.stub();

    // Act: Trigger ngOnInit (simulating navigation to expenses page)
    component.ngOnInit();

    // Assert: resetExpenseDefaults should not be called
    expect(wizardStateService.resetExpenseDefaults).not.toHaveBeenCalled();
    expect(wizardStateService.markExpensesSeeded).not.toHaveBeenCalled();
  });

  it('should reseed expenses when service decides to seed', () => {
    // Arrange: Mock that expenses need to be seeded
    wizardStateService.shouldReseedExpenses.and.returnValue(true);
    wizardStateService.resetExpenseDefaults.and.stub();
    wizardStateService.markExpensesSeeded.and.stub();

    // Act: Trigger ngOnInit (simulating first load or upstream change)
    component.ngOnInit();

    // Assert: resetExpenseDefaults should be called
    expect(wizardStateService.resetExpenseDefaults).toHaveBeenCalledWith(true);
    expect(wizardStateService.markExpensesSeeded).toHaveBeenCalled();
  });

  it('should call getComputedPropertiesSummary on init', () => {
    // Arrange
    wizardStateService.shouldReseedExpenses.and.returnValue(false);
    wizardStateService.getComputedPropertiesSummary.and.stub();

    // Act
    component.ngOnInit();

    // Assert
    expect(wizardStateService.getComputedPropertiesSummary).toHaveBeenCalled();
  });

  it('should scroll to top on init', () => {
    // Arrange
    spyOn(window, 'scrollTo');
    wizardStateService.shouldReseedExpenses.and.returnValue(false);

    // Act
    component.ngOnInit();

    // Assert
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should clear loading overlay after timeout', done => {
    // Arrange
    wizardStateService.shouldReseedExpenses.and.returnValue(false);
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    // Act
    component.ngOnInit();

    // Assert: Check that navigation is triggered after timeout
    setTimeout(() => {
      expect(router.navigateByUrl).toHaveBeenCalledWith(router.url, { skipLocationChange: true });
      done();
    }, 1100); // Slightly longer than the 1000ms timeout
  });
});
