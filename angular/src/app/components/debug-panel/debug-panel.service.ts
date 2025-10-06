import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DebugPanelService {
  private readonly _open$ = new BehaviorSubject<boolean>(false);
  readonly open$ = this._open$.asObservable();

  open(): void {
    this._open$.next(true);
  }
  close(): void {
    this._open$.next(false);
  }
  toggle(): void {
    this._open$.next(!this._open$.getValue());
  }

  constructor() {
    this.open$.subscribe((isOpen) => {
      const cls = 'debug-open';
      if (isOpen) {
        document.body.classList.add(cls);
      } else {
        document.body.classList.remove(cls);
      }
    });
  }
}
