import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandAssets } from '../../lib/brands';

export type Region = 'US' | 'CA';
export type BrandLogoVariant = 'main' | 'wide' | 'watermark';
export type BrandLogoSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-logo.component.html',
  styleUrls: ['./brand-logo.component.scss'],
})
export class BrandLogoComponent {
  @Input() region: Region = 'US';
  @Input() variant: BrandLogoVariant = 'main';
  @Input() size: BrandLogoSize = 'medium';

  @HostBinding('class') hostClass = '';

  imgError = false;

  get logoUrl(): string | undefined {
    const assets = this.region === 'US' ? (BrandAssets.us as any) : (BrandAssets.ca as any);
    if (!assets) return undefined;
    if (this.variant === 'wide') return assets.wide ?? assets.logo ?? assets.stack;
    if (this.variant === 'watermark') return assets.wide ?? assets.logo ?? assets.stack;
    return assets.stack ?? assets.logo ?? assets.wide;
  }

  get altText(): string {
    return this.region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada';
  }

  get heightPx(): number {
    return this.size === 'small' ? 32 : this.size === 'large' ? 64 : 48;
  }

  onError(): void {
    this.imgError = true;
  }
}
