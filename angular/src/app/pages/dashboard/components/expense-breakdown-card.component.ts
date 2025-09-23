import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { CalculationResults } from '../../../domain/types/calculation.types';

@Component({
  selector: 'app-expense-breakdown-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-breakdown-card.component.html'
})
export class ExpenseBreakdownCardComponent {
  @Input() results!: CalculationResults;
}


