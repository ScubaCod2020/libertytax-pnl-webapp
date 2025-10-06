import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { CalculationResults } from '../../../domain/types/calculation.types';

@Component({
  selector: 'app-income-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-summary-card.component.html',
})
export class IncomeSummaryCardComponent {
  @Input() results!: CalculationResults;
  @Input() hasOtherIncome: boolean = false;
}
