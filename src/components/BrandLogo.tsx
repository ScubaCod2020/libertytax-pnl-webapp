// BrandLogo.tsx - Regional brand logo component
// Displays the appropriate logo based on region selection
// Falls back to text if assets are missing or image fails

import React, { useState } from 'react'
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
  const [imgError, setImgError] = useState(false)

  const brandName = region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada'

  // Fallback text logo (used if no assets or image fails)
  const renderTextLogo = () => (
    <div
      className={className}
      style={{
        fontSize: size === 'small' ? '1rem' : size === 'large' ? '2rem' : '1.5rem',
        fontWeight: 700,
        color: 'var(--brand-primary, #1e40af)',
        ...style,
      }}
    >
      {brandName}
    </div>
  )

  // Bail out early if no assets
  if (!assets) {
    return renderTextLogo()
  }

  // Choose the appropriate logo variant
  const logoUrl =
    variant === 'wide'
      ? assets.logoWide || assets.logoUrl
      : variant === 'watermark'
      ? assets.watermarkUrl
      : assets.logoUrl

  // Size configurations
  const sizeStyles = {
    small: { height: '32px', width: 'auto' },
    medium: { height: '48px', width: 'auto' },
    large: { height: '64px', width: 'auto' },
  }

  // If no URL or error, fallback to text
  if (!logoUrl || imgError) {
    return renderTextLogo()
  }

  return (
    <img
      src={logoUrl}
      alt={brandName}
      className={className}
      style={{
        ...sizeStyles[size],
        objectFit: 'contain',
        ...style,
      }}
      onError={() => {
        console.warn(`Failed to load ${variant} logo for ${region} region, using text fallback`)
        setImgError(true)
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
  return <BrandLogo region={region} variant="main" size="small" />
}
