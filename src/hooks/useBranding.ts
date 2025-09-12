// useBranding.ts - Hook for regional branding management
// Handles dynamic brand switching based on region selection

import { useEffect } from 'react'
import type { Region } from '../lib/calcs'
import { getBrandForRegion, generateBrandCSSVars, type RegionalBrand } from '../styles/branding'

export function useBranding(region: Region) {
  const brand = getBrandForRegion(region)

  // 🔧 SAFETY CHECK: Ensure brand is valid
  if (!brand || !brand.colors) {
    console.error('useBranding: Invalid brand object', { region, brand })
    // Return fallback to prevent crash
    return {
      brand: null,
      colors: null,
      typography: null,
      assets: null,
      name: 'Liberty Tax',
      country: 'United States'
    }
  }

  // Apply brand CSS variables to document root
  useEffect(() => {
    const root = document.documentElement
    const cssVars = generateBrandCSSVars(brand)
    
    // Apply all CSS custom properties
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Update document title and favicon
    document.title = `${brand.name} • P&L Budget & Forecast`
    
    // Update favicon (create link element if it doesn't exist)
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    favicon.href = brand.assets.faviconUrl

    console.log(`🎨 Applied ${brand.name} branding for ${region} region`)
  }, [region, brand])

  return {
    brand,
    colors: brand.colors,
    typography: brand.typography,
    assets: brand.assets,
    name: brand.name,
    country: brand.country
  }
}

// Utility hook for getting brand colors in components
export function useBrandColors(region: Region) {
  const { colors } = useBranding(region)
  // 🔧 SAFETY CHECK: Return null if colors are unavailable
  return colors
}

// Utility hook for getting brand assets in components
export function useBrandAssets(region: Region) {
  const { assets } = useBranding(region)
  return assets
}
