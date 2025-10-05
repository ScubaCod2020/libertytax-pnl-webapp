import { inject } from '@angular/core';
import { DebugBusService } from './debug-bus.service';

export function startTrace(feature: string): {
  traceId: string;
  log: (kind: string, payload: any) => void;
} {
  const bus = inject(DebugBusService);
  const traceId = Math.random().toString(36).slice(2, 10);
  const log = (kind: string, payload: any) => {
    bus.push({ feature, kind, traceId, payload, ts: Date.now() });
  };
  return { traceId, log };
}
