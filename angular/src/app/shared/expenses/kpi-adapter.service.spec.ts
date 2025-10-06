import { describe, it, expect } from 'vitest';
import { KpiAdapterService } from './kpi-adapter.service';

describe('KpiAdapterService (stability)', () => {
  it('does not throw on nullish inputs and returns something', () => {
    const svc = new KpiAdapterService();
    // @ts-expect-error - passing null on purpose to exercise guards
    const out = svc.buildPayload(null);
    expect(out).toBeDefined();
  });
});
