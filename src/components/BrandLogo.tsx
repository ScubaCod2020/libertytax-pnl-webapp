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

  // If no assets loaded, fallback to text
  if (!assets) {
    return (
      <div className={className} style={style}>
        {region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada'}
      </div>
    )
  }

  // Choose logo variant
  const logoUrl = variant === 'wide' 
    ? assets.logoWide || assets.logoUrl
    : variant === 'watermark'
    ? assets.watermarkUrl
    : assets.logoUrl

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
      onError={() => {
        console.warn(`Failed to load ${variant} logo for ${region} region`)
      }}
    />
  )
}

// Convenience components
export function HeaderLogo({ region }: { region: Region }) {
  return <BrandLogo region={region} variant="wide" size="medium" style={{ maxWidth: '200px' }} />
}

export function CompactLogo({ region }: { region: Region }) {
  return <BrandLogo region={region} variant="main" size="small" />
}
