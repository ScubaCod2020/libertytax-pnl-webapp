export function ensureWizardReady(state: { step: number; form: Record<string, unknown> }): true {
  if (state == null || Number.isNaN(state.step)) {
    console.warn('[wizard] ensureWizardReady: missing/invalid state; continuing (additive no-op).');
  }
  return true;
}
