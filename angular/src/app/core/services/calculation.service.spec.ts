// Using Jasmine APIs (Angular default) instead of Vitest
import { CalculationService } from './calculation.service';

describe('CalculationService (stability)', () => {
  it('does not throw on nullish inputs and returns something', () => {
    const svc = new CalculationService();
    // @ts-expect-error - passing null on purpose to exercise guards
    const out = svc.calculate(null);
    expect(out).toBeDefined();
  });
});
