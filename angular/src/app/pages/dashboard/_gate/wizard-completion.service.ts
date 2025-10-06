import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'forecast.complete';

@Injectable({ providedIn: 'root' })
export class WizardCompletionService {
  readonly completeSignal = signal<boolean>(false);

  constructor() {
    this.load();
  }

  load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.completeSignal.set(raw === 'true');
    } catch {
      this.completeSignal.set(false);
    }
  }

  persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.completeSignal() ? 'true' : 'false');
    } catch {
      /* no-op */
    }
  }

  markComplete(): void {
    this.completeSignal.set(true);
    this.persist();
  }

  isComplete(): boolean {
    return this.completeSignal();
  }
}
