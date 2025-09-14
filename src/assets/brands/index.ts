// Brand Asset Imports
// Centralized imports for all brand assets

// US Liberty Tax Assets
const USLogoStack = 'assets/brands/us/LT-2022-Stack-Color-RGB.png'
const USLogoWide = 'assets/brands/us/LT-2022-Wide-RGB.png'
const USTorchLogo = 'assets/brands/us/__sitelogo__LT-Torch-CMYK.png'

// Canada Liberty Tax Assets  
const CALogo = 'assets/brands/ca/LT-Canada-Logo-RGB.jpg'
const CALogoWide = 'assets/brands/ca/LT-Canada-Wide-Red.png'
const CALeafIcon = 'assets/brands/ca/LTCA-Leaf-ISO-Red.jpg'

export const US_ASSETS = {
  logo: USLogoStack,        // Main logo (stacked version)
  logoWide: USLogoWide,     // Wide/horizontal version
  watermark: USTorchLogo,   // Use torch logo for watermark (like Canada's leaf)
  favicon: USTorchLogo      // Use torch for favicon
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
