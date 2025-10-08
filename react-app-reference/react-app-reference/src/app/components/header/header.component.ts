import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Region } from '../../models/wizard.models';
import { BrandingService } from '../../services/branding.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() region: Region = 'US';
  @Input() showWizard: boolean = true;
  @Input() wizardCompleted: boolean = false;
  @Input() currentPage: string = 'wizard';
  @Input() storeType?: string;

  @Output() setRegion = new EventEmitter<Region>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onShowWizard = new EventEmitter<void>();
  @Output() onShowDashboard = new EventEmitter<void>();
  @Output() onShowReports = new EventEmitter<void>();

  brandAssets: any = {};

  constructor(private brandingService: BrandingService) {}

  ngOnInit(): void {
    this.updateBranding();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['region']) {
      this.updateBranding();
    }
  }

  private updateBranding(): void {
    this.brandAssets = this.brandingService.getBrandAssets(this.region);
    this.brandingService.applyBrand(this.region);
  }

  onRegionChange(region: Region): void {
    this.region = region;
    this.setRegion.emit(region);
    this.updateBranding();
  }

  onShowWizardClick(): void {
    this.onShowWizard.emit();
  }

  onShowDashboardClick(): void {
    this.onShowDashboard.emit();
  }

  onResetClick(): void {
    this.onReset.emit();
  }

  onLogoError(event: any): void {
    console.warn('Failed to load logo image, falling back to text');
    console.warn('Attempted to load:', event.target.src);
    // Hide the image and show text fallback
    (event.target as HTMLElement).style.display = 'none';
    const brandSection = event.target.parentElement;
    brandSection.innerHTML = `<span class="brand-text">Liberty Tax ${this.region === 'CA' ? 'Canada' : 'US'}</span>`;
  }
}