// Brand Asset Imports
// Centralized imports for all brand assets

// US Liberty Tax Assets
import USLogoStack from './us/LT-2022-Stack-Color-RGB.png'
import USLogoWide from './us/LT-2022-Wide-RGB.png'

// Canada Liberty Tax Assets  
import CALogo from './ca/LT-Canada-Logo-RGB.jpg'
import CALogoWide from './ca/LT-Canada-Wide-Red.png'
import CALeafIcon from './ca/LTCA-Leaf-ISO-Red.jpg'

export const US_ASSETS = {
  logo: USLogoStack,        // Main logo (stacked version)
  logoWide: USLogoWide,     // Wide/horizontal version
  watermark: USLogoStack,   // Use stacked logo for watermark
  favicon: USLogoStack      // Can be processed to favicon
}

export const CA_ASSETS = {
  logo: CALogo,             // Main logo
  logoWide: CALogoWide,     // Wide version
  watermark: CALeafIcon,    // Use leaf icon for watermark (more subtle)
  favicon: CALeafIcon       // Use leaf for favicon
}

// Asset registry
export const BRAND_ASSETS = {
  US: US_ASSETS,
  CA: CA_ASSETS
} as const

// Helper to get assets for region
export function getAssetsForRegion(region: 'US' | 'CA') {
  return BRAND_ASSETS[region]
}
