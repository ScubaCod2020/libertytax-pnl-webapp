// kpi-stoplight.component.ts - Visual status indicator component
// Based on React app KPIStoplight component

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-stoplight',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-stoplight" [class.active]="active">
      <div class="stoplight-container">
        <div class="light red" [class.on]="active === 'red'"></div>
        <div class="light yellow" [class.on]="active === 'yellow'"></div>
        <div class="light green" [class.on]="active === 'green'"></div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-stoplight {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stoplight-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      background: #f3f4f6;
      border-radius: 12px;
      border: 1px solid #d1d5db;
    }

    .light {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      opacity: 0.3;
      transition: opacity 0.2s ease;
    }

    .light.red {
      background-color: #dc2626;
    }

    .light.yellow {
      background-color: #d97706;
    }

    .light.green {
      background-color: #059669;
    }

    .light.on {
      opacity: 1;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    }

    .kpi-stoplight.active .light.on {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `]
})
export class KpiStoplightComponent {
  @Input() active: 'red' | 'yellow' | 'green' = 'red';
}
