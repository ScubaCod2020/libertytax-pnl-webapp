// Using Jasmine APIs (Angular default) instead of Vitest
import { MetricsAssemblerService } from './metrics-assembler.service';

// Minimal fakes for constructor deps
class FakeCalculationService {
  calculate() {
    return { totalRevenue: 1000, totalReturns: 10, totalExpenses: 200 } as any;
  }
}
class FakeSettingsService {
  settings = { region: 'US' } as any;
}
class FakeProjectedService {
  get growthPct() {
    return 0;
  }
  get scenario() {
    return 'Custom';
  }
}
class FakeWizardStateService {
  get answers() {
    return {} as any;
  }
}

describe('MetricsAssemblerService (stability)', () => {
  it('returns metrics without throwing', () => {
    const svc = new MetricsAssemblerService(
      new FakeCalculationService() as any,
      new FakeSettingsService() as any,
      new FakeProjectedService() as any,
      new FakeWizardStateService() as any
    );
    const out = svc.buildDashboardPreviewMetrics();
    expect(out).toBeDefined();
    expect(out.revenue).toBeDefined();
    expect(out.returns).toBeDefined();
    expect(out.cpr).toBeDefined();
  });
});
