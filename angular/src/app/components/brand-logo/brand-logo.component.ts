import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandAssets } from '../../lib/brands';
import { ThemeService } from '../../core/services/theme.service';
import { getAssetUrl } from '../../lib/regional-branding';

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
  @Input() customClass?: string;
  @Input() customStyle?: { [key: string]: string };

  constructor(private themeService: ThemeService) {}

  @HostBinding('class')
  get hostClass(): string {
    return this.customClass || '';
  }

  @HostBinding('style')
  get hostStyle(): { [key: string]: string } | null {
    return this.customStyle || null;
  }

  imgError = false;

  get logoUrl(): string | undefined {
    // Use BrandAssets directly based on region
    if (this.region === 'CA') {
      const assets = BrandAssets.ca;
      if (this.variant === 'wide') {
        return assets.wide;
      }
      if (this.variant === 'watermark') {
        return assets.leaf;
      }
      // Default 'main' variant for CA
      return assets.logo;
    } else {
      const assets = BrandAssets.us;
      if (this.variant === 'wide') {
        return assets.wide;
      }
      if (this.variant === 'watermark') {
        return assets.torch;
      }
      // Default 'main' variant for US
      return assets.stack;
    }
  }

  get altText(): string {
    return this.region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada';
  }

  get heightPx(): number {
    // Balance between performance and visual appeal - reasonable sizes that don't dominate the UI
    if (this.variant === 'wide') {
      return this.size === 'small' ? 60 : this.size === 'large' ? 80 : 70; // More reasonable sizes for header
    }
    return this.size === 'small' ? 32 : this.size === 'large' ? 64 : 48;
  }

  onError(): void {
    console.warn(`Failed to load ${this.variant} logo for ${this.region} region`);
    this.imgError = true;
  }
}
