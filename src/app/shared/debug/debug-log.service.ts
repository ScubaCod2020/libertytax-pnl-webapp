import { Injectable } from '@angular/core';

export interface DebugEvent {
  key: string;
  type: 'amount' | 'percent' | 'note' | 'status';
  prev?: unknown;
  next?: unknown;
  extra?: Record<string, unknown>;
  ts: number;
}

@Injectable({ providedIn: 'root' })
export class DebugLogService {
  private events: DebugEvent[] = [];

  push(e: Omit<DebugEvent, 'ts'>) {
    const evt: DebugEvent = { ...e, ts: Date.now() } as DebugEvent;
    this.events.push(evt);
    // Dev console output
    try {
      // eslint-disable-next-line no-console
      console.groupCollapsed(`[DBG] ${e.key} ${e.type} @ ${new Date(evt.ts).toLocaleTimeString()}`);
      // eslint-disable-next-line no-console
      console.table(evt);
      // eslint-disable-next-line no-console
      console.groupEnd();
    } catch {}
  }

  get snapshot(): DebugEvent[] {
    return this.events.slice(-200);
  }
}
