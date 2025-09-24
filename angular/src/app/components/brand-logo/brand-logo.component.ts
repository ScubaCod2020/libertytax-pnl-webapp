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
    // Use comprehensive branding system with fallbacks
    const brand = this.themeService.currentRegion === this.region 
      ? this.themeService.currentBrand 
      : this.themeService.currentBrand; // For now, use current brand
    
    // Enhanced variant logic for React parity with comprehensive branding
    if (this.variant === 'wide') {
      return brand.assets.logoWide ?? brand.assets.logoUrl;
    }
    if (this.variant === 'watermark') {
      return brand.assets.watermarkUrl ?? brand.assets.logoWide ?? brand.assets.logoUrl;
    }
    // Default 'main' variant
    return brand.assets.logoUrl;
  }

  get altText(): string {
    return this.region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada';
  }

  get heightPx(): number {
    return this.size === 'small' ? 32 : this.size === 'large' ? 64 : 48;
  }

  onError(): void {
    console.warn(`Failed to load ${this.variant} logo for ${this.region} region`);
    this.imgError = true;
  }
}
