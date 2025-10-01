import { TestBed } from '@angular/core/testing';
import { KpiAdapterService } from '../../expenses/kpi-adapter.service';
import { KpiEvaluatorService } from '../../../domain/services/kpi-evaluator.service';

describe('KpiAdapterService', () => {
  let svc: KpiAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [KpiAdapterService, KpiEvaluatorService] });
    svc = TestBed.inject(KpiAdapterService);
  });

  it('maps rent monthly correctly and preserves telephone percent', () => {
    const answers: any = {
      region: 'US',
      handlesTaxRush: false,
      projectedTaxPrepIncome: 600000,
      rentPct: 5,
      telephoneAmt: 4800,
    };
    const dto = svc.buildPayload(answers);
    expect(dto).toBeTruthy();
    expect(dto.rentMonthly).toBeGreaterThan(0);
    expect(dto.telephonePct).toBeGreaterThan(0);
  });
});
