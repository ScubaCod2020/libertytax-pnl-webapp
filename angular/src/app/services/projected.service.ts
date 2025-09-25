import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Scenario = 'Custom' | 'Good' | 'Better' | 'Best';

@Injectable({ providedIn: 'root' })
export class ProjectedService {
  private readonly _scenario$ = new BehaviorSubject<Scenario>('Custom');
  readonly scenario$ = this._scenario$.asObservable();

  get scenario(): Scenario {
    return this._scenario$.getValue();
  }
  setScenario(next: any): void {
    console.log('🚀 [ProjectedService] Scenario changed to:', next);
    this._scenario$.next((next as Scenario) || 'Custom');
  }

  // Growth percent (applies to selected targets). Presets from scenario.
  private readonly _growthPct$ = new BehaviorSubject<number>(2);
  readonly growthPct$ = this._growthPct$.asObservable();
  get growthPct(): number {
    return this._growthPct$.getValue();
  }
  setGrowthPct(pct: number): void {
    console.log('🚀 [ProjectedService] Growth percentage changed to:', `${pct}%`);
    this._growthPct$.next(pct);
  }

  // Selected targets to apply growth
  private readonly _targets$ = new BehaviorSubject<{
    returns: boolean;
    avgNetFee: boolean;
    otherIncome: boolean;
    taxRush: boolean;
    all: boolean;
  }>({ returns: true, avgNetFee: true, otherIncome: false, taxRush: false, all: true });
  readonly targets$ = this._targets$.asObservable();
  get targets() {
    return this._targets$.getValue();
  }
  toggleTarget(
    key: 'all' | 'returns' | 'avgNetFee' | 'otherIncome' | 'taxRush',
    value: boolean
  ): void {
    console.log('🚀 [ProjectedService] Target toggled:', key, '→', value);
    if (key === 'all') {
      const next = {
        returns: value,
        avgNetFee: value,
        otherIncome: value,
        taxRush: value,
        all: value,
      };
      console.log('🚀 [ProjectedService] All targets set to:', value);
      this._targets$.next(next);
      return;
    }
    const curr = this.targets;
    const next = { ...curr, [key]: value } as typeof curr;
    next.all = next.returns && next.avgNetFee && next.otherIncome && next.taxRush;
    console.log('🚀 [ProjectedService] Updated targets:', next);
    this._targets$.next(next);
  }

  // Apply scenario preset → sets growthPct
  applyScenarioPreset(): void {
    const s = this.scenario;
    const preset = s === 'Good' ? 2 : s === 'Better' ? 5 : s === 'Best' ? 10 : 0;
    console.log('🚀 [ProjectedService] Applying scenario preset:', s, '→', `${preset}%`);
    this.setGrowthPct(preset);
  }
}
