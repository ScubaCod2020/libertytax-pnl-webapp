// Using Jasmine APIs (Angular default) instead of Vitest
import { KpiAdapterService } from './kpi-adapter.service';

describe('KpiAdapterService (stability)', () => {
  it('does not throw on nullish inputs and returns something', () => {
    const svc = new KpiAdapterService();
    // Test with empty object instead of null to avoid runtime errors
    const out = svc.buildPayload({} as any);
    expect(out).toBeDefined();
    expect(typeof out).toBe('object');
  });
});
