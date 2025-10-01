import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Light = 'green' | 'yellow' | 'red';

@Component({
  selector: 'app-kpi-stoplight',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="stoplight" 
      [attr.aria-label]="'status ' + active"
      role="img"
      [attr.aria-description]="getStatusDescription()"
    >
      <div 
        *ngFor="let lens of lenses; trackBy: trackByLens"
        class="lens"
        [class.active]="lens === active"
        [style.background]="getLensColor(lens)"
        [attr.data-status]="lens"
      ></div>
    </div>
  `,
  styles: [`
    .stoplight {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 4px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.1);
      width: 24px;
    }

    .lens {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      transition: all 0.2s ease;
      border: 1px solid rgba(0, 0, 0, 0.2);
    }

    .lens.active {
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
      transform: scale(1.1);
    }

    /* CSS Custom Properties for consistent theming */
    :host {
      --ok-green: #16a34a;
      --warn-yellow: #f59e0b;
      --bad-red: #dc2626;
      --inactive-grey: #c8c8c8;
    }
  `]
})
export class KpiStoplightComponent {
  @Input() active: Light = 'green';

  readonly lenses: Light[] = ['red', 'yellow', 'green'];

  private readonly colors = {
    green: 'var(--ok-green, #16a34a)',
    yellow: 'var(--warn-yellow, #f59e0b)', 
    red: 'var(--bad-red, #dc2626)',
    grey: 'var(--inactive-grey, #c8c8c8)'
  };

  getLensColor(lens: Light): string {
    return lens === this.active ? this.colors[lens] : this.colors.grey;
  }

  getStatusDescription(): string {
    const descriptions = {
      green: 'Good performance status',
      yellow: 'Warning performance status', 
      red: 'Poor performance status'
    };
    return descriptions[this.active];
  }

  trackByLens(index: number, lens: Light): Light {
    return lens;
  }
}
