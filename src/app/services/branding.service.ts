import { Injectable } from '@angular/core';
import { Region, RegionalBrand, BrandColors, BrandTypography, BrandAssets } from '../models/wizard.models';

// Brand asset paths (Angular handles assets differently than React)
const US_ASSETS: BrandAssets = {
  logoUrl: 'assets/brands/us/LT-2022-Stack-Color-RGB.png',
  logoWide: 'assets/brands/us/LT-2022-Wide-RGB.png',
  watermarkUrl: 'assets/brands/us/__sitelogo__LT-Torch-CMYK.png',
  faviconUrl: 'assets/brands/us/__sitelogo__LT-Torch-CMYK.png'
};

const CA_ASSETS: BrandAssets = {
  logoUrl: 'assets/brands/ca/LT-Canada-Logo-RGB.jpg',
  logoWide: 'assets/brands/ca/LT-Canada-Wide-Red.png',
  watermarkUrl: 'assets/brands/ca/LTCA-Leaf-ISO-Red.jpg',
  faviconUrl: 'assets/brands/ca/LTCA-Leaf-ISO-Red.jpg'
};

// Shared typography configuration for both regions
const BRAND_TYPOGRAPHY: BrandTypography = {
  primaryFont: '"Proxima Nova", Arial, sans-serif',
  printFont: '"Proxima Nova", "Times New Roman", serif',
  weights: {
    regular: 400,    // Proxima Nova Regular / Inter Regular
    medium: 500,     // Proxima Nova Medium / Inter Medium
    semibold: 600,   // Proxima Nova Semibold / Inter SemiBold  
    extrabold: 800   // Proxima Nova Extrabold / Inter ExtraBold
  },
  headlineSpacing: '2px'
};

// US Brand Configuration (Liberty Tax US - Official Colors)
const US_BRAND: RegionalBrand = {
  colors: {
    primary: '#EA0029',        // RED - Official Liberty Tax red (same as Canada)
    primaryHover: '#C8001F',   // Darker shade for hover states
    primaryLight: '#FDE8EC',   // Light tint for backgrounds
    
    secondary: '#21346A',      // BLUE - for secondary actions and income
    secondaryHover: '#1A2B54', 
    secondaryLight: '#E8ECF5',
    
    accent: '#5B9A94',         // STATUE TEAL - for highlights and accents
    accentLight: '#E8F3F2',
    
    success: '#5B9A94',        // Use Statue Teal for success states
    warning: '#f59e0b',        // Keep standard warning orange
    error: '#EA0029',          // Use brand red for errors
    info: '#1A1F2A',           // Use NAVY for info states
    
    // Auto-calc field colors using brand palette
    autoCalcEditable: '#E8F3F2',    // Very light Statue Teal
    autoCalcDisplayOnly: '#F5F5F5', // Soft gray (lighter than brand gray)
    
    textPrimary: '#3B3C3F',    // DARK GRAY for primary text (same as Canada)
    textSecondary: '#6b7280',  // Standard secondary text
    textMuted: '#BAB9B9'       // GRAY for muted text
  },
  typography: BRAND_TYPOGRAPHY,
  assets: US_ASSETS,
  name: 'Liberty Tax',
  country: 'United States'
};

// Canada Brand Configuration (Liberty Tax Canada - Official Colors)
const CA_BRAND: RegionalBrand = {
  colors: {
    primary: '#EA0029',        // Our Red - Official Liberty Tax Canada red
    primaryHover: '#C8001F',   // Darker shade for hover states
    primaryLight: '#FDE8EC',   // Light tint for backgrounds
    
    secondary: '#2E485E',      // Web Dark Blue - for secondary actions
    secondaryHover: '#243A4A', 
    secondaryLight: '#E8F0F5',
    
    accent: '#D0EBF2',         // Web Blue - for highlights and accents
    accentLight: '#EDF8FC',
    
    success: '#10b981',        // Keep standard success green
    warning: '#f59e0b',        // Keep standard warning orange
    error: '#EA0029',          // Use brand red for errors
    info: '#2E485E',           // Use brand dark blue for info
    
    // Auto-calc field colors using brand palette
    autoCalcEditable: '#EDF8FC',    // Very light Web Blue
    autoCalcDisplayOnly: '#F5F5F5', // Soft gray (lighter than #BBBBBB)
    
    textPrimary: '#3B3C3F',    // Dark Gray for primary text
    textSecondary: '#6b7280',  // Standard secondary text
    textMuted: '#BBBBBB'       // Light Gray for muted text
  },
  typography: BRAND_TYPOGRAPHY,
  assets: CA_ASSETS,
  name: 'Liberty Tax Canada',
  country: 'Canada'
};

// Brand registry
const REGIONAL_BRANDS = {
  US: US_BRAND,
  CA: CA_BRAND
} as const;

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  
  constructor() { }

  /**
   * Get brand configuration for a specific region
   */
  getBrandForRegion(region: Region): RegionalBrand {
    // Safety check: Handle undefined/invalid region
    if (!region || (region !== 'US' && region !== 'CA')) {
      console.warn(`getBrandForRegion: Invalid region "${region}", defaulting to US`);
      return REGIONAL_BRANDS.US;
    }
    return REGIONAL_BRANDS[region];
  }

  /**
   * Generate CSS custom properties for a brand
   */
  generateBrandCSSVars(brand: RegionalBrand): Record<string, string> {
    return {
      // Colors
      '--brand-primary': brand.colors.primary,
      '--brand-primary-hover': brand.colors.primaryHover,
      '--brand-primary-light': brand.colors.primaryLight,
      '--brand-secondary': brand.colors.secondary,
      '--brand-secondary-hover': brand.colors.secondaryHover,
      '--brand-secondary-light': brand.colors.secondaryLight,
      '--brand-accent': brand.colors.accent,
      '--brand-accent-light': brand.colors.accentLight,
      '--brand-success': brand.colors.success,
      '--brand-warning': brand.colors.warning,
      '--brand-error': brand.colors.error,
      '--brand-info': brand.colors.info,
      '--brand-auto-calc-editable': brand.colors.autoCalcEditable,
      '--brand-auto-calc-display': brand.colors.autoCalcDisplayOnly,
      '--brand-text-primary': brand.colors.textPrimary,
      '--brand-text-secondary': brand.colors.textSecondary,
      '--brand-text-muted': brand.colors.textMuted,
      
      // Typography
      '--brand-font-primary': brand.typography.primaryFont,
      '--brand-font-print': brand.typography.printFont,
      '--brand-weight-regular': brand.typography.weights.regular.toString(),
      '--brand-weight-medium': brand.typography.weights.medium.toString(),
      '--brand-weight-semibold': brand.typography.weights.semibold.toString(),
      '--brand-weight-extrabold': brand.typography.weights.extrabold.toString(),
      '--brand-headline-spacing': brand.typography.headlineSpacing
    };
  }

  /**
   * Apply brand styling to the document
   */
  applyBrand(region: Region): void {
    const brand = this.getBrandForRegion(region);
    const root = document.documentElement;
    const cssVars = this.generateBrandCSSVars(brand);
    
    // Apply all CSS custom properties
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update document title and favicon
    document.title = `${brand.name} • P&L Budget & Forecast`;
    
    // Update favicon (create link element if it doesn't exist)
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = brand.assets.faviconUrl;

    console.log(`🎨 Applied ${brand.name} branding for ${region} region`);
  }

  /**
   * Get brand colors for a region
   */
  getBrandColors(region: Region): BrandColors {
    return this.getBrandForRegion(region).colors;
  }

  /**
   * Get brand assets for a region
   */
  getBrandAssets(region: Region): BrandAssets {
    return this.getBrandForRegion(region).assets;
  }
}
