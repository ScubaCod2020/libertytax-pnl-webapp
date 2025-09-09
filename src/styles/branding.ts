// Regional Branding System
// Centralized branding configuration for US and Canada regions

import { US_ASSETS, CA_ASSETS } from '../assets/brands'

export interface BrandColors {
  // Primary brand colors
  primary: string
  primaryHover: string
  primaryLight: string
  
  // Secondary colors
  secondary: string
  secondaryHover: string
  secondaryLight: string
  
  // Accent colors
  accent: string
  accentLight: string
  
  // Status colors
  success: string
  warning: string
  error: string
  info: string
  
  // Background colors for auto-calculating fields
  autoCalcEditable: string    // Light primary tint for editable auto-calc fields
  autoCalcDisplayOnly: string // Light gray for display-only auto-calc fields
  
  // Text colors
  textPrimary: string
  textSecondary: string
  textMuted: string
}

export interface BrandTypography {
  // Font families
  primaryFont: string        // Main brand font with fallbacks
  printFont: string         // Font for print/PDF documents
  
  // Font weights following Proxima Nova hierarchy
  weights: {
    regular: number         // 400 - Proxima Nova Regular
    medium: number          // 500 - Proxima Nova Medium  
    semibold: number        // 600 - Proxima Nova Semibold
    extrabold: number       // 800 - Proxima Nova Extrabold
  }
  
  // Letter spacing for headlines (+200 tracking as per guidelines)
  headlineSpacing: string
}

export interface BrandAssets {
  logoUrl: string
  watermarkUrl: string
  faviconUrl: string
  // Future: additional artwork, icons, etc.
}

export interface RegionalBrand {
  colors: BrandColors
  typography: BrandTypography
  assets: BrandAssets
  name: string
  country: string
}

// Shared typography configuration for both regions
const BRAND_TYPOGRAPHY: BrandTypography = {
  primaryFont: 'var(--brand-font-stack, "Proxima Nova", "Inter", "Source Sans Pro", Arial, sans-serif)',
  printFont: '"Times New Roman", serif',
  weights: {
    regular: 400,    // Proxima Nova Regular / Inter Regular
    medium: 500,     // Proxima Nova Medium / Inter Medium
    semibold: 600,   // Proxima Nova Semibold / Inter SemiBold  
    extrabold: 800   // Proxima Nova Extrabold / Inter ExtraBold
  },
  headlineSpacing: '2px'
}

// US Brand Configuration (Liberty Tax US - Official Colors)
export const US_BRAND: RegionalBrand = {
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
  assets: {
    logoUrl: US_ASSETS.logo,
    watermarkUrl: US_ASSETS.watermark,
    faviconUrl: US_ASSETS.favicon
  },
  name: 'Liberty Tax',
  country: 'United States'
}

// Canada Brand Configuration (Liberty Tax Canada - Official Colors)
export const CA_BRAND: RegionalBrand = {
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
  assets: {
    logoUrl: CA_ASSETS.logo,
    watermarkUrl: CA_ASSETS.watermark,
    faviconUrl: CA_ASSETS.favicon
  },
  name: 'Liberty Tax Canada',
  country: 'Canada'
}

// Brand registry
export const REGIONAL_BRANDS = {
  US: US_BRAND,
  CA: CA_BRAND
} as const

// Helper to get current brand
export function getBrandForRegion(region: 'US' | 'CA'): RegionalBrand {
  return REGIONAL_BRANDS[region]
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
    '--brand-headline-spacing': brand.typography.headlineSpacing
  }
}
