import { inject, Injector, runInInjectionContext } from '@angular/core';
import { DebugBusService } from './debug-bus.service';

export function startTrace(
  feature: string,
  injector?: Injector
): {
  traceId: string;
  log: (kind: string, payload: any) => void;
} {
  const traceId = Math.random().toString(36).slice(2, 10);

  // Try to get the debug bus service, but fallback gracefully if not available
  let bus: DebugBusService | null = null;

  try {
    if (injector) {
      bus = runInInjectionContext(injector, () => inject(DebugBusService));
    } else {
      // Fallback: try direct injection (will fail if not in injection context)
      bus = inject(DebugBusService);
    }
  } catch (error) {
    // If injection fails, silently use console logging as fallback
    // Don't spam the console with warnings - this is expected in many contexts
    bus = null;
  }

  const log = (kind: string, payload: any) => {
    if (bus) {
      bus.push({ feature, kind, traceId, payload, ts: Date.now() });
    } else {
      // Fallback to console logging, but throttle to prevent spam
      // Only log if we haven't logged for this feature in the last 100ms
      const now = Date.now();
      const lastLogKey = `lastLog_${feature}`;
      const lastLog = (window as any)[lastLogKey] || 0;

      if (now - lastLog > 100) {
        console.log(`[${feature}:${kind}]`, payload);
        (window as any)[lastLogKey] = now;
      }
    }
  };

  return { traceId, log };
}
