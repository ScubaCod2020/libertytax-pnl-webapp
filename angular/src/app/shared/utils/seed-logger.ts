import { environment } from '@env/environment';

export function logSeed(event: string, data?: unknown) {
  if (environment.seedingDebug) {
    // eslint-disable-next-line no-console
    console.log(`[SEED] ${event}`, data ?? '');
  }
}
