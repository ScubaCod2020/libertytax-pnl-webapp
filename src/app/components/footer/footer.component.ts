import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() showWizard: boolean = true;
  @Input() wizardCompleted: boolean = false;
  @Input() currentPage: string = 'wizard';

  @Output() onNavigate = new EventEmitter<string>();

  onNavigateClick(page: string): void {
    this.onNavigate.emit(page);
  }
}