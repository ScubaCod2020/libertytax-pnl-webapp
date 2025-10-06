import { Injectable, signal } from '@angular/core';
type WizardForm = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class WizardStateFacade {
  private readonly _step = signal<number>(0);
  private readonly _form = signal<WizardForm>({});

  get step() {
    return this._step();
  }
  get form() {
    return this._form();
  }

  read<K extends keyof WizardForm>(key: K, fallback: WizardForm[K]) {
    const f = this._form();
    return (f[key] ?? fallback) as WizardForm[K];
  }
  upsert(patch: Partial<WizardForm>) {
    this._form.update((curr) => ({ ...curr, ...patch }));
  }
  setStep(next: number) {
    if (Number.isFinite(next) && next >= 0) this._step.set(next);
  }
  next() {
    this._step.update((n) => n + 1);
  }
  prev() {
    this._step.update((n) => Math.max(0, n - 1));
  }

  snapshot() {
    return { step: this._step(), form: { ...this._form() } };
  }
}
