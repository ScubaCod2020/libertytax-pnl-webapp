import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  REGIONAL_BRANDS,
  getBrandForRegion,
  generateBrandCSSVars,
  type RegionalBrand,
} from '../../lib/regional-branding';

export type Region = 'US' | 'CA';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentRegionSubject = new BehaviorSubject<Region>('US');
  private currentBrandSubject = new BehaviorSubject<RegionalBrand>(REGIONAL_BRANDS.US);

  public readonly currentRegion$ = this.currentRegionSubject.asObservable();
  public readonly currentBrand$ = this.currentBrandSubject.asObservable();

  constructor() {
    // Initialize theme on service creation
    this.applyTheme(this.currentRegionSubject.value);
  }

  /**
   * Get the current region
   */
  get currentRegion(): Region {
    return this.currentRegionSubject.value;
  }

  /**
   * Get the current brand configuration
   */
  get currentBrand(): RegionalBrand {
    return this.currentBrandSubject.value;
  }

  /**
   * Switch to a different regional theme
   */
  setRegion(region: Region): void {
    if (region === this.currentRegionSubject.value) {
      return; // No change needed
    }

    console.log(
      `🎨 ThemeService: Switching from ${this.currentRegionSubject.value} to ${region} theme`
    );

    this.currentRegionSubject.next(region);
    this.applyTheme(region);
  }

  /**
   * Apply the theme for the specified region
   */
  private applyTheme(region: Region): void {
    const brand = getBrandForRegion(region);
    const cssVars = generateBrandCSSVars(brand);

    // Apply CSS custom properties to document root
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update brand subject
    this.currentBrandSubject.next(brand);

    console.log(
      `🎨 ThemeService: Applied ${region} theme with ${Object.keys(cssVars).length} CSS variables`
    );
  }

  /**
   * Get CSS variables for the current theme
   */
  getCurrentCSSVars(): Record<string, string> {
    return generateBrandCSSVars(this.currentBrand);
  }

  /**
   * Get a specific color from the current brand
   */
  getColor(colorKey: keyof RegionalBrand['colors']): string {
    return this.currentBrand.colors[colorKey];
  }

  /**
   * Get typography configuration from the current brand
   */
  getTypography(): RegionalBrand['typography'] {
    return this.currentBrand.typography;
  }

  /**
   * Get assets configuration from the current brand
   */
  getAssets(): RegionalBrand['assets'] {
    return this.currentBrand.assets;
  }

  /**
   * Generate inline styles object for Angular components
   */
  getInlineStyles(styleMap: Partial<Record<keyof RegionalBrand['colors'], string>>): {
    [key: string]: string;
  } {
    const styles: { [key: string]: string } = {};

    Object.entries(styleMap).forEach(([cssProperty, colorKey]) => {
      if (colorKey && colorKey in this.currentBrand.colors) {
        styles[cssProperty] = this.currentBrand.colors[colorKey as keyof RegionalBrand['colors']];
      }
    });

    return styles;
  }
}
