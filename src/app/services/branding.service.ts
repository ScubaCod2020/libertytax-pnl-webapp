import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { BrandAssets } from '../lib/brands';

type BrandVars = Record<string, string>;

const US_VARS: BrandVars = {
  '--brand-primary': '#EA0029',
  '--brand-primary-hover': '#C8001F',
  '--brand-primary-light': '#FDE8EC',
  '--brand-secondary': '#21346A',
  '--brand-secondary-hover': '#1A2B54',
  '--brand-secondary-light': '#E8ECF5',
  '--brand-accent': '#5B9A94',
  '--brand-accent-light': '#E8F3F2',
  '--brand-success': '#5B9A94',
  '--brand-warning': '#f59e0b',
  '--brand-error': '#EA0029',
  '--brand-info': '#1A1F2A',
  '--brand-text-primary': '#3B3C3F',
  '--brand-text-secondary': '#6b7280',
  '--brand-text-muted': '#BAB9B9',
};

const CA_VARS: BrandVars = {
  '--brand-primary': '#EA0029',
  '--brand-primary-hover': '#C8001F',
  '--brand-primary-light': '#FDE8EC',
  '--brand-secondary': '#2E485E',
  '--brand-secondary-hover': '#243A4A',
  '--brand-secondary-light': '#E8F0F5',
  '--brand-accent': '#D0EBF2',
  '--brand-accent-light': '#EDF8FC',
  '--brand-success': '#10b981',
  '--brand-warning': '#f59e0b',
  '--brand-error': '#EA0029',
  '--brand-info': '#2E485E',
  '--brand-text-primary': '#3B3C3F',
  '--brand-text-secondary': '#6b7280',
  '--brand-text-muted': '#BBBBBB',
};

/**
 * BrandingService
 * React source parity: react-app-reference/src/hooks/useBranding.ts and styles/branding.ts
 * Responsibility:
 *  - Apply region-specific CSS custom properties (colors, text) to document root
 *  - Update document title and favicon based on region
 *  - Ensure base typography variables are present for components and print
 */
@Injectable({ providedIn: 'root' })
export class BrandingService {
  constructor(private settings: SettingsService) {
    this.settings.settings$.subscribe((s) => this.applyBrandVars(s.region));
    this.applyBrandVars(this.settings.settings.region);
  }

  private applyBrandVars(region: 'US' | 'CA'): void {
    const vars = region === 'US' ? US_VARS : CA_VARS;
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    // Typography variables (align with branding.ts model)
    root.style.setProperty('--font-base', 'var(--font-proxima)');
    root.style.setProperty('--fw-regular', '400');
    root.style.setProperty('--fw-medium', '500');
    root.style.setProperty('--fw-semibold', '600');
    root.style.setProperty('--fw-extrabold', '800');
    root.style.setProperty('--headline-spacing', '2px');

    // Document title and favicon per region
    const titleName = region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada';
    document.title = `${titleName} • P&L Budget & Forecast`;

    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    const assetPath = region === 'US' ? BrandAssets.us.torch : BrandAssets.ca.leaf;
    favicon!.href = assetPath;
  }
}
