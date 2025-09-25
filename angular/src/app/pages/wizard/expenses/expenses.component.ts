import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpensesFormComponent as ExpensesBlock } from './components/expenses.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [RouterLink, ExpensesBlock],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {}
