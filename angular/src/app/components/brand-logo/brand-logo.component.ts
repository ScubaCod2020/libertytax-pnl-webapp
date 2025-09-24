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
  @Input() customClass?: string;
  @Input() customStyle?: { [key: string]: string };

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
    const assets = this.region === 'US' ? (BrandAssets.us as any) : (BrandAssets.ca as any);
    if (!assets) return undefined;
    
    // Enhanced variant logic for React parity
    if (this.variant === 'wide') {
      return assets.wide ?? assets.logo ?? assets.stack;
    }
    if (this.variant === 'watermark') {
      // For watermark, prefer wider/logo versions for better watermark effect
      return assets.wide ?? assets.logo ?? assets.stack;
    }
    // Default 'main' variant - prefer stack/logo for main display
    return assets.stack ?? assets.logo ?? assets.wide;
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
