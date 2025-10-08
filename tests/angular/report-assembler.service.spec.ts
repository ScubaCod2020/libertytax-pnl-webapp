import { ReportAssemblerService } from '../../src/app/services/report-assembler.service';

describe('ReportAssemblerService', () => {
  it('computeCPR returns 0 when returns is 0', () => {
    const svc = new ReportAssemblerService();
    expect(svc.computeCPR(1000, 0)).toBe(0);
  });

  it('computeCPR divides expenses by returns', () => {
    const svc = new ReportAssemblerService();
    expect(svc.computeCPR(2000, 100)).toBe(20);
  });
});


