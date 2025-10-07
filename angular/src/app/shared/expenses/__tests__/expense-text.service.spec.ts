import { TestBed } from '@angular/core/testing';
import { SharedExpenseTextService } from '../../expenses/expense-text.service';
import { WizardStateService } from '../../../core/services/wizard-state.service';
import { KpiEvaluatorService } from '../../../domain/services/kpi-evaluator.service';

describe('SharedExpenseTextService', () => {
  let svc: SharedExpenseTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedExpenseTextService, WizardStateService, KpiEvaluatorService],
    });
    svc = TestBed.inject(SharedExpenseTextService);
  });

  it('builds observable note string for telephone', (done) => {
    svc.note$('telephone' as any).subscribe((str) => {
      expect(typeof str).toBe('string');
      done();
    });
  });

  it('ANF tooltip/note return strings and reflect region', (done) => {
    const wizard = TestBed.inject(WizardStateService);
    wizard.updateAnswers({ region: 'CA', avgNetFee: 130 });
    svc.anfTooltip$().subscribe((tooltip) => {
      expect(typeof tooltip).toBe('string');
      expect(tooltip).toContain('CA');
      done();
    });
  });
});
