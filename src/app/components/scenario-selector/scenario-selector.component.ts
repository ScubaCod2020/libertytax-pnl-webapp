import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type Scenario = 'Custom' | 'Good' | 'Better' | 'Best';

export interface ScenarioOption {
  value: Scenario;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-scenario-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scenario-selector">
      <label 
        *ngIf="label"
        [for]="elementId"
        class="scenario-label"
      >
        {{ label }}
      </label>
      
      <select 
        [id]="elementId"
        [value]="scenario"
        (change)="onScenarioChange($event)"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || label || 'Scenario'"
        class="scenario-select"
      >
        <option 
          *ngFor="let option of scenarios; trackBy: trackByScenario"
          [value]="option.value"
          [selected]="option.value === scenario"
        >
          {{ option.label }}
        </option>
      </select>

      <div 
        *ngIf="showDescription && selectedScenarioDescription"
        class="scenario-description"
      >
        {{ selectedScenarioDescription }}
      </div>
    </div>
  `,
  styles: [`
    .scenario-selector {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .scenario-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .scenario-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background-color: white;
      font-size: 0.875rem;
      color: #374151;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .scenario-select:hover:not(:disabled) {
      border-color: #9ca3af;
    }

    .scenario-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .scenario-select:disabled {
      background-color: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .scenario-description {
      font-size: 0.75rem;
      color: #6b7280;
      line-height: 1.4;
      margin-top: 0.25rem;
    }

    /* Inline layout variant */
    .scenario-selector.inline {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }

    .scenario-selector.inline .scenario-label {
      margin-bottom: 0;
      white-space: nowrap;
    }

    .scenario-selector.inline .scenario-description {
      margin-top: 0;
      margin-left: 0.5rem;
    }

    /* Compact variant */
    .scenario-selector.compact .scenario-select {
      padding: 0.375rem 0.5rem;
      font-size: 0.8125rem;
    }

    .scenario-selector.compact .scenario-label {
      font-size: 0.8125rem;
    }
  `]
})
export class ScenarioSelectorComponent {
  @Input() scenario: Scenario = 'Custom';
  @Input() scenarios: ScenarioOption[] = [
    { value: 'Custom', label: 'Custom', description: 'Custom scenario with manual adjustments' },
    { value: 'Good', label: 'Good', description: 'Good growth scenario (+2% target growth)' },
    { value: 'Better', label: 'Better', description: 'Better growth scenario (+5% target growth)' },
    { value: 'Best', label: 'Best', description: 'Best growth scenario (+10% target growth)' }
  ];
  @Input() label?: string;
  @Input() disabled = false;
  @Input() showDescription = false;
  @Input() layout: 'vertical' | 'inline' = 'vertical';
  @Input() variant: 'normal' | 'compact' = 'normal';
  @Input() ariaLabel?: string;
  @Input() enableDebugLogging = false;

  @Output() scenarioChange = new EventEmitter<Scenario>();

  private static idCounter = 0;
  readonly elementId = `scenario-selector-${++ScenarioSelectorComponent.idCounter}`;

  get hostClasses(): string {
    const classes = ['scenario-selector'];
    if (this.layout === 'inline') classes.push('inline');
    if (this.variant === 'compact') classes.push('compact');
    return classes.join(' ');
  }

  get selectedScenarioDescription(): string | undefined {
    return this.scenarios.find(s => s.value === this.scenario)?.description;
  }

  onScenarioChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newScenario = target.value as Scenario;
    
    // Debug logging (similar to React version)
    if (this.enableDebugLogging) {
      console.log('🎯 SCENARIO SELECTOR DEBUG:', {
        component: 'scenario_selector',
        oldScenario: this.scenario,
        newScenario: newScenario,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    this.scenarioChange.emit(newScenario);
  }

  trackByScenario(index: number, option: ScenarioOption): Scenario {
    return option.value;
  }
}
