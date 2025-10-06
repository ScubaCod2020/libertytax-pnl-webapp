import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-gate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section
      *ngIf="!complete"
      class="card"
      style="margin:16px; padding:16px;"
      data-test="gate-locked"
    >
      <div class="card-title">Finish Quick Wizard to unlock Dashboard</div>
      <p class="small">Complete the forecast inputs to view the dashboard.</p>
      <a routerLink="/wizard/income-drivers" class="btn btn--primary">Go to Wizard</a>
    </section>

    <ng-container *ngIf="complete">
      <ng-content></ng-content>
    </ng-container>
  `,
})
export class DashboardGateComponent {
  @Input() complete = false;
}
