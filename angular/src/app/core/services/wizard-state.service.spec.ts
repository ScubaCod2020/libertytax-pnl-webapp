import { TestBed } from '@angular/core/testing';
import { WizardStateService } from './wizard-state.service';
import { BiDirService } from './bidir/bidir.service';
import { ProjectedService } from '../../services/projected.service';

describe('WizardStateService seeding', () => {
  let service: WizardStateService;
  let bidirService: jasmine.SpyObj<BiDirService>;
  let projectedService: jasmine.SpyObj<ProjectedService>;

  beforeEach(() => {
    const bidirSpy = jasmine.createSpyObj('BiDirService', ['updateAnswers']);
    const projectedSpy = jasmine.createSpyObj('ProjectedService', [], {
      targets$: { subscribe: jasmine.createSpy() },
      growthPct$: { subscribe: jasmine.createSpy() },
    });

    TestBed.configureTestingModule({
      providers: [
        WizardStateService,
        { provide: BiDirService, useValue: bidirSpy },
        { provide: ProjectedService, useValue: projectedSpy },
      ],
    });

    service = TestBed.inject(WizardStateService);
    bidirService = TestBed.inject(BiDirService) as jasmine.SpyObj<BiDirService>;
    projectedService = TestBed.inject(ProjectedService) as jasmine.SpyObj<ProjectedService>;
  });

  it('seeds when not seeded yet', () => {
    const upstream = {
      region: 'US' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 1000,
    };
    expect(service.shouldReseedExpenses(upstream)).toBeTrue();
  });

  it('does not reseed when upstream unchanged', () => {
    const upstream = {
      region: 'US' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 1000,
    };
    service.markExpensesSeeded(upstream);
    expect(service.shouldReseedExpenses(upstream)).toBeFalse();
  });

  it('reseeds when upstream changes', () => {
    const u1 = {
      region: 'US' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 1000,
    };
    const u2 = {
      region: 'US' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 2000,
    };
    service.markExpensesSeeded(u1);
    expect(service.shouldReseedExpenses(u2)).toBeTrue();
  });

  it('reseeds when store type changes', () => {
    const u1 = {
      region: 'US' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 1000,
    };
    const u2 = {
      region: 'US' as const,
      storeType: 'existing' as const,
      projectedTaxPrepIncome: 1000,
    };
    service.markExpensesSeeded(u1);
    expect(service.shouldReseedExpenses(u2)).toBeTrue();
  });

  it('reseeds when region changes', () => {
    const u1 = {
      region: 'US' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 1000,
    };
    const u2 = {
      region: 'CA' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 1000,
    };
    service.markExpensesSeeded(u1);
    expect(service.shouldReseedExpenses(u2)).toBeTrue();
  });

  it('maintains stable hash for identical objects with different property order', () => {
    const u1 = {
      region: 'US' as const,
      storeType: 'new' as const,
      projectedTaxPrepIncome: 1000,
      avgNetFee: 125,
    };
    const u2 = {
      avgNetFee: 125,
      projectedTaxPrepIncome: 1000,
      storeType: 'new' as const,
      region: 'US' as const,
    };
    service.markExpensesSeeded(u1);
    expect(service.shouldReseedExpenses(u2)).toBeFalse();
  });
});
