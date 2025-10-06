import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WizardStep } from '../../domain/types/wizard.types';

@Component({
  selector: 'lt-wizard-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wizard-page" [attr.data-wizard-step]="step">
      <!-- Page Header -->
      <div class="card-title">{{ title }}</div>
      <div *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</div>

      <!-- Page Content -->
      <div class="page-content">
        <ng-content></ng-content>
      </div>

      <!-- Navigation Buttons -->
      <div *ngIf="showNavigation" class="navigation-footer">
        <div class="nav-left">
          <button *ngIf="showCancel" type="button" class="btn-cancel" (click)="onCancelClick()">
            Cancel
          </button>
        </div>

        <div class="nav-right">
          <button *ngIf="showBack" type="button" class="btn-back" (click)="onBackClick()">
            {{ backLabel }}
          </button>

          <button
            *ngIf="showNext"
            type="button"
            class="btn-next"
            [class.disabled]="!canProceed"
            [disabled]="!canProceed"
            (click)="onNextClick()"
          >
            {{ nextLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .wizard-page {
        padding-left: 1rem;
      }

      .card-title {
        /* Add card-title styles here or import from global styles */
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .card-subtitle {
        /* Add card-subtitle styles here or import from global styles */
        font-size: 1rem;
        color: #6b7280;
        margin-bottom: 1rem;
      }

      .page-content {
        /* Content area for wizard sections */
      }

      .navigation-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .nav-left,
      .nav-right {
        display: flex;
        gap: 0.5rem;
      }

      .btn-cancel {
        padding: 0.5rem 1rem;
        background-color: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .btn-cancel:hover {
        background-color: #e5e7eb;
      }

      .btn-back {
        padding: 0.5rem 1rem;
        background-color: white;
        color: #374151;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .btn-back:hover {
        background-color: #f9fafb;
      }

      .btn-next {
        padding: 0.5rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .btn-next:hover:not(.disabled) {
        background-color: #2563eb;
      }

      .btn-next.disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
      }
    `,
  ],
})
export class WizardPageComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() step: WizardStep = 'inputs';
  @Input() canProceed = true;
  @Input() nextLabel = 'Next';
  @Input() backLabel = 'Back';

  @Output() nextClick = new EventEmitter<void>();
  @Output() backClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();

  get showNavigation(): boolean {
    return this.showNext || this.showBack || this.showCancel;
  }

  get showNext(): boolean {
    return this.nextClick.observed;
  }

  get showBack(): boolean {
    return this.backClick.observed;
  }

  get showCancel(): boolean {
    return this.cancelClick.observed;
  }

  onNextClick(): void {
    if (this.canProceed) {
      this.nextClick.emit();
    }
  }

  onBackClick(): void {
    this.backClick.emit();
  }

  onCancelClick(): void {
    this.cancelClick.emit();
  }
}
