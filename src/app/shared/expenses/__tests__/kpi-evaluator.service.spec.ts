import { TestBed } from '@angular/core/testing';
import { KpiEvaluatorService } from '../../../domain/services/kpi-evaluator.service';

describe('KpiEvaluatorService', () => {
  let svc: KpiEvaluatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [KpiEvaluatorService] });
    svc = TestBed.inject(KpiEvaluatorService);
  });

  it('evaluates telephone percentage into yellow/red/green', () => {
    const a: any = {
      region: 'US',
      handlesTaxRush: false,
      projectedTaxPrepIncome: 500000,
      telephoneAmt: 7000, // ~1.4%
    };
    const statuses = svc.evaluate(a);
    expect(['yellow', 'red', 'green']).toContain(statuses['telephone']);
  });

  describe('ANF bands US', () => {
    const make = (v: number) => ({ region: 'US', avgNetFee: v, projectedAvgNetFee: v }) as any;
    it('199.99 -> red', () => expect(svc.getAnfStatus(make(199.99))).toBe('red'));
    it('200 -> yellow', () => expect(svc.getAnfStatus(make(200))).toBe('yellow'));
    it('275 -> green', () => expect(svc.getAnfStatus(make(275))).toBe('green'));
    it('349.99 -> green', () => expect(svc.getAnfStatus(make(349.99))).toBe('green'));
    it('350 -> yellow', () => expect(svc.getAnfStatus(make(350))).toBe('yellow'));
    it('400 -> red', () => expect(svc.getAnfStatus(make(400))).toBe('red'));
  });

  describe('ANF bands CA', () => {
    const make = (v: number) => ({ region: 'CA', avgNetFee: v, projectedAvgNetFee: v }) as any;
    it('84.99 -> red', () => expect(svc.getAnfStatus(make(84.99))).toBe('red'));
    it('85 -> yellow', () => expect(svc.getAnfStatus(make(85))).toBe('yellow'));
    it('120 -> green', () => expect(svc.getAnfStatus(make(120))).toBe('green'));
    it('149.99 -> green', () => expect(svc.getAnfStatus(make(149.99))).toBe('green'));
    it('150 -> yellow', () => expect(svc.getAnfStatus(make(150))).toBe('yellow'));
    it('185 -> red', () => expect(svc.getAnfStatus(make(185))).toBe('red'));
  });
});
