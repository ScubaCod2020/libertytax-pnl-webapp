// Using Jasmine APIs (Angular default) instead of Vitest
import { KpiEvaluatorService } from './kpi-evaluator.service';

describe('KpiEvaluatorService (stability)', () => {
  it('does not throw on nullish inputs and returns statuses', () => {
    const svc = new KpiEvaluatorService();
    const out = svc.evaluate({} as any);
    expect(out).toBeDefined();
  });
});
