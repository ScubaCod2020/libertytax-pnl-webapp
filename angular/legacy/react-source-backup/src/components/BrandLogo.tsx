// BrandLogo.tsx - Regional brand logo component
// Displays the appropriate logo based on region selection

import React from 'react'
import { useBrandAssets } from '../hooks/useBranding'
import type { Region } from '../lib/calcs'

interface BrandLogoProps {
  region: Region
  variant?: 'main' | 'wide' | 'watermark'
  size?: 'small' | 'medium' | 'large'
  className?: string
  style?: React.CSSProperties
}

export default function BrandLogo({ 
  region, 
  variant = 'main', 
  size = 'medium',
  className,
  style 
}: BrandLogoProps) {
  const assets = useBrandAssets(region)
  
  // Choose the appropriate logo variant
  const logoUrl = assets ? (
    variant === 'wide' 
      ? assets.logoWide || assets.logoUrl  // Use wide logo or fall back to standard
      : variant === 'watermark'
      ? assets.watermarkUrl
      : assets.logoUrl
  ) : '/logo.png' // Fallback logo

  // Size configurations
  const sizeStyles = {
    small: { height: '32px', width: 'auto' },
    medium: { height: '48px', width: 'auto' },
    large: { height: '64px', width: 'auto' }
  }

  const brandName = region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada'

  return (
    <img
      src={logoUrl}
      alt={brandName}
      className={className}
      style={{
        ...sizeStyles[size],
        objectFit: 'contain',
        ...style
      }}
      onError={(e) => {
        console.warn(`Failed to load ${variant} logo for ${region} region`)
        // Could fallback to text or different logo variant
      }}
    />
  )
}

// Convenience components for specific use cases
export function HeaderLogo({ region }: { region: Region }) {
  return (
    <BrandLogo 
      region={region} 
      variant="wide" 
      size="medium"
      style={{ maxWidth: '200px' }}
    />
  )
}

export function CompactLogo({ region }: { region: Region }) {
  return (
    <BrandLogo 
      region={region} 
      variant="main" 
      size="small"
    />
  )
}
