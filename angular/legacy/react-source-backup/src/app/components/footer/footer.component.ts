import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer-section">
      <div class="footer-grid">
        <div class="footer-column">
          <h4 class="footer-title">Navigation</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link" [class.active]="currentPage === 'wizard'" (click)="onNavigate('wizard')">Setup Wizard</a></li>
            <li><a href="#" class="footer-link" [class.active]="currentPage === 'dashboard'" (click)="onNavigate('dashboard')">Dashboard</a></li>
            <li><a href="#" class="footer-link" (click)="onNavigate('reports')">Reports</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h4 class="footer-title">Quick Links</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link" (click)="onNavigate('pro-tips')">Pro-Tips</a></li>
            <li><a href="#" class="footer-link" (click)="onNavigate('practice')">Practice Problems</a></li>
            <li><a href="#" class="footer-link" (click)="onNavigate('export')">Export (PDF/Excel)</a></li>
            <li><a href="#" class="footer-link" (click)="onNavigate('support')">Support Center</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h4 class="footer-title">Resources</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link" (click)="onNavigate('settings')">Settings</a></li>
            <li><a href="#" class="footer-link" (click)="onNavigate('training')">Training Materials</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h4 class="footer-title">About & Status</h4>
          <div class="footer-content">
            <p class="footer-text">P&L Budget & Forecast</p>
            <p class="footer-text">Version 0.5 Preview</p>
            <p class="footer-text">Liberty Tax Service</p>
          </div>
        </div>
      </div>
      
      <div class="footer-copyright">
        © 2024 Liberty Tax Service. All rights reserved. P&L Budget & Forecast v0.5 Preview
      </div>
    </footer>
  `,
  styles: [`
    .footer-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 2rem;
      margin-top: 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-column {
      display: flex;
      flex-direction: column;
    }

    .footer-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 1rem 0;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-link {
      color: #6b7280;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.15s ease-in-out;
      cursor: pointer;
    }

    .footer-link:hover {
      color: #374151;
    }

    .footer-link.active {
      color: #3b82f6;
      font-weight: 500;
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-text {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .footer-copyright {
      text-align: center;
      font-size: 0.75rem;
      color: #9ca3af;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
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
