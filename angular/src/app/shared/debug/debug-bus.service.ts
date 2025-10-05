import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DebugEvent {
  feature: string;
  kind: string;
  traceId: string;
  payload: any;
  ts: number;
}

@Injectable({ providedIn: 'root' })
export class DebugBusService {
  private buffer: DebugEvent[] = [];
  private subject = new BehaviorSubject<DebugEvent[]>([]);
  readonly events$ = this.subject.asObservable();

  push(event: DebugEvent): void {
    this.buffer.push(event);
    if (this.buffer.length > 200) this.buffer.shift();
    this.subject.next([...this.buffer]);
  }
}
