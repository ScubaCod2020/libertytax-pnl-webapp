import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lt-app-state-debug',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      *ngIf="show"
      class="app-state-debug"
    >
      <div class="debug-title">Debug</div>
      <div class="debug-info">key: {{ storageKey }}</div>
      <div class="debug-info">origin: {{ origin }}</div>
      <div class="debug-info">version: {{ appVersion }}</div>
      <div class="debug-info">
        ready: {{ isReady }} | hydrating: {{ isHydrating }}
      </div>
      <div class="debug-info">last saved: {{ savedAt }}</div>

      <div class="debug-actions">
        <button class="debug-btn" (click)="onSaveNow()">
          Save now
        </button>

        <button class="debug-btn" (click)="onDumpStorage()">
          Dump
        </button>

        <button class="debug-btn" (click)="onCopyJSON()">
          Copy JSON
        </button>

        <button class="debug-btn" (click)="onClearStorage()">
          Clear key
        </button>

        <button class="debug-btn" (click)="onShowWizard()">
          Wizard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .app-state-debug {
      position: fixed;
      right: 12px;
      top: 12px;
      padding: 8px;
      background: #111;
      color: #eee;
      border-radius: 6px;
      font-size: 11px;
      z-index: 1000;
      max-width: 200px;
    }

    .debug-title {
      font-weight: 700;
      margin-bottom: 6px;
    }

    .debug-info {
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 2px;
    }

    .debug-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .debug-btn {
      font-size: 12px;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.1);
      color: #eee;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .debug-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .debug-btn:active {
      background: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class AppStateDebugComponent {
  @Input() show = false;
  @Input() storageKey = '';
  @Input() origin = '';
  @Input() appVersion = '';
  @Input() isReady = false;
  @Input() isHydrating = false;
  @Input() savedAt = '';

  @Output() saveNow = new EventEmitter<void>();
  @Output() dumpStorage = new EventEmitter<void>();
  @Output() copyJSON = new EventEmitter<void>();
  @Output() clearStorage = new EventEmitter<void>();
  @Output() showWizard = new EventEmitter<void>();

  onSaveNow(): void {
    this.saveNow.emit();
  }

  onDumpStorage(): void {
    this.dumpStorage.emit();
  }

  onCopyJSON(): void {
    this.copyJSON.emit();
  }

  onClearStorage(): void {
    this.clearStorage.emit();
  }

  onShowWizard(): void {
    this.showWizard.emit();
  }
}
