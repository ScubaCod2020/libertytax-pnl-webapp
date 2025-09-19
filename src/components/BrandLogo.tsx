// src/components/BrandLogo.tsx
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
  style,
}: BrandLogoProps) {
  const assets = useBrandAssets(region)

  // Guard while assets resolve
  if (!assets) return null

  const logoUrl =
    variant === 'wide'
      ? assets.logoWide || assets.logoUrl
      : variant === 'watermark'
      ? assets.watermarkUrl
      : assets.logoUrl

  const sizeStyles: Record<NonNullable<BrandLogoProps['size']>, React.CSSProperties> = {
    small: { height: '32px', width: 'auto' },
    medium: { height: '48px', width: 'auto' },
    large: { height: '64px', width: 'auto' },
  }

  const brandName = region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada'

  return (
    <img
      src={logoUrl}
      alt={brandName}
      className={className}
      style={{ ...sizeStyles[size], objectFit: 'contain', ...style }}
      onError={() => {
        // optional: fall back to text or hide image
        console.warn(`Failed to load ${variant} logo for ${region} region`)
      }}
    />
  )
}
