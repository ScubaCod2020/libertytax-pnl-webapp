import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lt-toggle-question',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      *ngIf="showOnlyWhen"
      class="toggle-section"
      style="margin-bottom: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;"
    >
      <div style="margin-bottom: 0.5rem;">
        <label style="font-weight: 600;" [style.color]="titleColor">{{ title }}</label>
      </div>
      <div style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #475569;">
        {{ description }}
      </div>
      <div style="display: flex; gap: 1rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input
            type="radio"
            [name]="fieldName"
            [checked]="fieldValue === true"
            (change)="onPositiveChange()"
            style="margin-right: 0.25rem;"
          />
          <span style="font-weight: 500;">{{ positiveLabel }}</span>
        </label>
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input
            type="radio"
            [name]="fieldName"
            [checked]="fieldValue === false"
            (change)="onNegativeChange()"
            style="margin-right: 0.25rem;"
          />
          <span style="font-weight: 500;">{{ negativeLabel }}</span>
        </label>
      </div>
    </div>
  `,
})
export class ToggleQuestionComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() fieldName = '';
  @Input() fieldValue?: boolean;
  @Input() positiveLabel = '';
  @Input() negativeLabel = '';
  @Input() fieldsToeClearOnDisable: string[] = [];
  @Input() titleColor = '#6b7280';
  @Input() showOnlyWhen = true;
  
  @Output() valueChange = new EventEmitter<{ [key: string]: any }>();

  onPositiveChange(): void {
    this.valueChange.emit({ [this.fieldName]: true });
  }

  onNegativeChange(): void {
    // Clear related fields when disabling
    const clearUpdates: { [key: string]: any } = {};
    this.fieldsToeClearOnDisable.forEach(field => {
      clearUpdates[field] = undefined;
    });

    this.valueChange.emit({
      [this.fieldName]: false,
      ...clearUpdates,
    });
  }
}
