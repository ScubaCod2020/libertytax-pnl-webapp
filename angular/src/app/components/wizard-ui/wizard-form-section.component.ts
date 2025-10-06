import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lt-wizard-form-section',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card" [style.background]="background" [style.border]="border">
      <div
        class="card-title"
        style="display:flex; align-items:center; justify-content:space-between; gap:12px;"
      >
        <div style="display:flex; align-items:center; gap:8px;">
          <span *ngIf="icon">{{ icon }}</span>
          <span>{{ title }}</span>
        </div>
        <button
          *ngIf="showReset"
          class="btn btn--reset"
          (click)="reset.emit()"
          title="Reset section to defaults"
        >
          Reset
        </button>
      </div>
      <div *ngIf="description" class="small" style="color:#6b7280; margin:-6px 0 10px 0;">
        {{ description }}
      </div>
      <ng-content></ng-content>
    </section>
  `,
})
export class WizardFormSectionComponent {
  @Input() title = '';
  @Input() icon?: string;
  @Input() description?: string;
  @Input() background?: string;
  @Input() border?: string;
  @Input() showReset = false;
  @Output() reset = new EventEmitter<void>();
}
