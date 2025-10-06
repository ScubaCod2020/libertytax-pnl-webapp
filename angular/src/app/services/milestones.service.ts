import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MILESTONES, MilestoneItem, MilestoneState } from '../lib/milestones';

const STORAGE_KEY = 'LT_MILESTONES_V1';
const LOG_KEY = 'LT_DEV_PROGRESS_LOG_V1';

@Injectable({ providedIn: 'root' })
export class MilestonesService {
  private readonly _items$ = new BehaviorSubject<MilestoneItem[]>(this.load());
  readonly items$ = this._items$.asObservable();

  private load(): MilestoneItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as MilestoneItem[];
    } catch {}
    return MILESTONES.map((m) => ({ ...m }));
  }

  private persist(items: MilestoneItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  updateState(id: string, state: MilestoneState): void {
    const items = [...this._items$.getValue()];
    const idx = items.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const prev = items[idx];
    const next: MilestoneItem = { ...prev, state, updatedAt: new Date().toISOString() };
    items[idx] = next;
    this._items$.next(items);
    this.persist(items);
    this.appendLog(`Milestone ${prev.label} -> ${state}`);
  }

  appendLog(message: string): void {
    const ts = new Date().toISOString();
    const line = `- ${ts} - ${message}`;
    try {
      const raw = localStorage.getItem(LOG_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      arr.push(line);
      localStorage.setItem(LOG_KEY, JSON.stringify(arr));
    } catch {}
  }

  getLog(): string[] {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  clearLog(): void {
    try {
      localStorage.removeItem(LOG_KEY);
    } catch {}
  }
}
