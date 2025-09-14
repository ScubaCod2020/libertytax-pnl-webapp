import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Region } from '../../models/wizard.models';
import { BrandingService } from '../../services/branding.service';

@Component({
  selector: 'app-brand-watermark',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="brand-watermark"
      [style.opacity]="0.05">
      <img
        [src]="watermarkUrl"
        [alt]="watermarkAlt"
        class="watermark-image"
        (error)="onImageError($event)"
      />
    </div>
  `,
  styles: [`
    .brand-watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 0; /* Behind all content */
      pointer-events: none; /* Don't interfere with clicks */
      user-select: none; /* Can't be selected */
    }

    .watermark-image {
      width: 800px;
      height: auto;
      max-width: 70vw; /* More responsive sizing - fills more space */
      max-height: 70vh; /* Taller on desktop */
      min-width: 320px; /* Minimum size for mobile */
      object-fit: contain;
      filter: grayscale(20%); /* Slightly reduce saturation for watermark effect */
    }

    .watermark-image.hidden {
      display: none;
    }

    @media (max-width: 768px) {
      .watermark-image {
        width: 400px;
        min-width: 280px;
      }
    }
  `]
})
export class BrandWatermarkComponent implements OnInit, OnChanges {
  @Input() region: Region = 'US';

  watermarkUrl: string = '';
  watermarkAlt: string = '';

  constructor(private brandingService: BrandingService) {}

  ngOnInit(): void {
    this.updateWatermark();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['region']) {
      this.updateWatermark();
    }
  }

  private updateWatermark(): void {
    const assets = this.brandingService.getBrandAssets(this.region);
    this.watermarkUrl = assets.watermarkUrl;
    this.watermarkAlt = `${this.region === 'CA' ? 'Liberty Tax Canada' : 'Liberty Tax'} watermark`;
  }

  onImageError(event: any): void {
    console.warn(`Failed to load watermark for ${this.region} region`);
    event.target.classList.add('hidden');
  }
}
