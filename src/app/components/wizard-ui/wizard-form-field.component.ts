import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lt-wizard-form-field',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-row">
      <label>
        {{ label }}
        <span *ngIf="required" class="req">*</span>
      </label>
      <div class="grid-field">
        <ng-content></ng-content>
        <div *ngIf="helpText" class="help italic">{{ helpText }}</div>
      </div>
      <div *ngIf="note" class="small note">{{ note }}</div>
    </div>
  `,
})
export class WizardFormFieldComponent {
  @Input() label = '';
  @Input() required = false;
  @Input() helpText?: string;
  @Input() note?: string;
}
