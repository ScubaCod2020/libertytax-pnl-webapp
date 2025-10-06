import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandAssets } from '../../lib/brands';

export type Region = 'US' | 'CA';

@Component({
  selector: 'app-brand-watermark',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-watermark.component.html',
  styleUrls: ['./brand-watermark.component.scss'],
})
export class BrandWatermarkComponent {
  @Input() region: Region = 'US';
  imgError = false;

  get watermarkUrl(): string | undefined {
    const assets = this.region === 'US' ? (BrandAssets.us as any) : (BrandAssets.ca as any);
    // Enhanced watermark asset selection for React parity
    // Prefer wider/logo versions for better watermark effect
    return assets?.wide ?? assets?.logo ?? assets?.stack ?? assets?.torch ?? assets?.leaf;
  }

  get brandName(): string {
    return this.region === 'US' ? 'LIBERTY TAX' : 'LIBERTY TAX CANADA';
  }

  onError(): void {
    console.warn(`Failed to load watermark for ${this.region} region`);
    this.imgError = true;
  }
}
