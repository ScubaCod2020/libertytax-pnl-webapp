import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pro-tips-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pro-tips-card.component.html',
  styleUrls: ['./pro-tips-card.component.scss'],
})
export class ProTipsCardComponent {
  @Input() results: unknown;
  @Input() thresholds: unknown;
}
