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
    // Prefer the US torch for watermark; otherwise fall back sensibly
    if (this.region === 'US' && assets?.torch) return assets.torch;
    return assets?.wide ?? assets?.logo ?? assets?.stack ?? assets?.leaf;
  }

  onError(): void {
    this.imgError = true;
  }
}
