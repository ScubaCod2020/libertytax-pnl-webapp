// Regional Branding System
// Centralized branding configuration for US and Canada regions
// Ported from React styles/branding.ts with Angular enhancements

import { BrandAssets } from './brands';

export interface BrandColors {
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryLight: string;

  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;

  // Accent colors
  accent: string;
  accentLight: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Background colors for auto-calculating fields
  autoCalcEditable: string; // Light primary tint for editable auto-calc fields
  autoCalcDisplayOnly: string; // Light gray for display-only auto-calc fields

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export interface BrandTypography {
  // Font families
  primaryFont: string; // Main brand font with fallbacks
  printFont: string; // Font for print/PDF documents

  // Font weights following Proxima Nova hierarchy
  weights: {
    regular: number; // 400 - Proxima Nova Regular
    medium: number; // 500 - Proxima Nova Medium
    semibold: number; // 600 - Proxima Nova Semibold
    extrabold: number; // 800 - Proxima Nova Extrabold
  };

  // Letter spacing for headlines (+200 tracking as per guidelines)
  headlineSpacing: string;
}

export interface RegionalBrandAssets {
  logoUrl: string;
  logoWide?: string; // Wide/horizontal version for headers
  watermarkUrl: string;
  faviconUrl: string;
  // Future: additional artwork, icons, etc.
}

export interface RegionalBrand {
  colors: BrandColors;
  typography: BrandTypography;
  assets: RegionalBrandAssets;
  name: string;
  country: string;
}

// Shared typography configuration for both regions
const BRAND_TYPOGRAPHY: BrandTypography = {
  primaryFont:
    'var(--brand-font-stack, "Proxima Nova", "Inter", "Source Sans Pro", Arial, sans-serif)',
  printFont: '"Times New Roman", serif',
  weights: {
    regular: 400, // Proxima Nova Regular / Inter Regular
    medium: 500, // Proxima Nova Medium / Inter Medium
    semibold: 600, // Proxima Nova Semibold / Inter SemiBold
    extrabold: 800, // Proxima Nova Extrabold / Inter ExtraBold
  },
  headlineSpacing: '2px',
};

// US Brand Configuration (Liberty Tax US - Official Colors)
export const US_BRAND: RegionalBrand = {
  colors: {
    primary: '#EA0029', // RED - Official Liberty Tax red (same as Canada)
    primaryHover: '#C8001F', // Darker shade for hover states
    primaryLight: '#FDE8EC', // Light tint for backgrounds

    secondary: '#21346A', // BLUE - for secondary actions and income
    secondaryHover: '#1A2B54',
    secondaryLight: '#E8ECF5',

    accent: '#5B9A94', // STATUE TEAL - for highlights and accents
    accentLight: '#E8F3F2',

    success: '#5B9A94', // Use Statue Teal for success states
    warning: '#f59e0b', // Keep standard warning orange
    error: '#EA0029', // Use brand red for errors
    info: '#1A1F2A', // Use NAVY for info states

    // Auto-calc field colors using brand palette
    autoCalcEditable: '#E8F3F2', // Very light Statue Teal
    autoCalcDisplayOnly: '#F5F5F5', // Soft gray (lighter than brand gray)

    textPrimary: '#3B3C3F', // DARK GRAY for primary text (same as Canada)
    textSecondary: '#6b7280', // Standard secondary text
    textMuted: '#BAB9B9', // GRAY for muted text
  },
  typography: BRAND_TYPOGRAPHY,
  assets: {
    logoUrl: BrandAssets.us.stack || BrandAssets.us.wide,
    logoWide: BrandAssets.us.wide,
    watermarkUrl: BrandAssets.us.wide || BrandAssets.us.stack || BrandAssets.us.torch,
    faviconUrl: BrandAssets.us.torch || BrandAssets.us.stack,
  },
  name: 'Liberty Tax',
  country: 'United States',
};

// Canada Brand Configuration (Liberty Tax Canada - Official Colors)
export const CA_BRAND: RegionalBrand = {
  colors: {
    primary: '#EA0029', // Our Red - Official Liberty Tax Canada red
    primaryHover: '#C8001F', // Darker shade for hover states
    primaryLight: '#FDE8EC', // Light tint for backgrounds

    secondary: '#2E485E', // Web Dark Blue - for secondary actions
    secondaryHover: '#243A4A',
    secondaryLight: '#E8F0F5',

    accent: '#D0EBF2', // Web Blue - for highlights and accents
    accentLight: '#EDF8FC',

    success: '#10b981', // Keep standard success green
    warning: '#f59e0b', // Keep standard warning orange
    error: '#EA0029', // Use brand red for errors
    info: '#2E485E', // Use brand dark blue for info

    // Auto-calc field colors using brand palette
    autoCalcEditable: '#EDF8FC', // Very light Web Blue
    autoCalcDisplayOnly: '#F5F5F5', // Soft gray (lighter than #BBBBBB)

    textPrimary: '#3B3C3F', // Dark Gray for primary text
    textSecondary: '#6b7280', // Standard secondary text
    textMuted: '#BBBBBB', // Light Gray for muted text
  },
  typography: BRAND_TYPOGRAPHY,
  assets: {
    logoUrl: BrandAssets.ca.logo || BrandAssets.ca.wide,
    logoWide: BrandAssets.ca.wide,
    watermarkUrl: BrandAssets.ca.wide || BrandAssets.ca.logo || BrandAssets.ca.leaf,
    faviconUrl: BrandAssets.ca.leaf || BrandAssets.ca.logo,
  },
  name: 'Liberty Tax Canada',
  country: 'Canada',
};

// Brand registry
export const REGIONAL_BRANDS = {
  US: US_BRAND,
  CA: CA_BRAND,
} as const;

// Helper to get current brand
export function getBrandForRegion(region: 'US' | 'CA'): RegionalBrand {
  // 🔧 SAFETY CHECK: Handle undefined/invalid region
  if (!region || (region !== 'US' && region !== 'CA')) {
    console.warn(`getBrandForRegion: Invalid region "${region}", defaulting to US`);
    return REGIONAL_BRANDS.US;
  }
  return REGIONAL_BRANDS[region];
}

// CSS custom properties helper
export function generateBrandCSSVars(brand: RegionalBrand): Record<string, string> {
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
    '--brand-headline-spacing': brand.typography.headlineSpacing,

    // Legacy compatibility with existing Angular CSS custom properties
    '--ok-green': brand.colors.success,
    '--warn-yellow': brand.colors.warning,
    '--bad-red': brand.colors.error,
    '--err-red': brand.colors.error,
  };
}

// Enhanced asset resolution with fallbacks
export function getAssetUrl(region: 'US' | 'CA', assetType: keyof RegionalBrandAssets): string {
  const brand = getBrandForRegion(region);
  const assetUrl = brand.assets[assetType];
  
  if (!assetUrl) {
    console.warn(`getAssetUrl: Missing ${assetType} asset for ${region} region, using fallback`);
    // Fallback to logoUrl if specific asset is missing
    return brand.assets.logoUrl;
  }
  
  return assetUrl;
}
