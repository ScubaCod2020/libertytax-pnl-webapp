import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  constructor(public settingsSvc: SettingsService) {}
  get settings() {
    return this.settingsSvc.settings;
  }
}
