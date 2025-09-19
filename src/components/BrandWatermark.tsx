// BrandWatermark.tsx - Regional brand watermark component
// Displays centered, scrolling watermark logo with proper transparency
// Falls back to text watermark if image assets are missing

import React from 'react'
import { useBrandAssets, useBranding } from '../hooks/useBranding'
import type { Region } from '../lib/calcs'

interface BrandWatermarkProps {
  region: Region
}

export default function BrandWatermark({ region }: BrandWatermarkProps) {
  const assets = useBrandAssets(region)
  const { brand } = useBranding(region)

  // Fallback text watermark (used if no assets or no image URL)
  const renderTextWatermark = () => (
    <div
      className="brand-watermark-text"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.03,
        userSelect: 'none',
        fontSize: '8rem',
        fontWeight: 100,
        color: 'var(--brand-primary)',
        letterSpacing: '0.2em',
        whiteSpace: 'nowrap',
      }}
    >
      {(brand?.name ?? (region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada')).toUpperCase()}
    </div>
  )

  if (!assets || !assets.watermarkUrl) {
    return renderTextWatermark()
  }

  return (
    <div
      className="brand-watermark"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.05,
        userSelect: 'none',
      }}
    >
      <img
        src={assets.watermarkUrl}
        alt={`${region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada'} watermark`}
        style={{
          width: '800px',
          height: 'auto',
          maxWidth: '70vw',
          maxHeight: '70vh',
          minWidth: '320px',
          objectFit: 'contain',
          filter: 'grayscale(20%)',
        }}
        onError={(e) => {
          console.warn(`Failed to load watermark for ${region} region, falling back to text`)
          e.currentTarget.style.display = 'none'
          // Replace image with text watermark if image fails
          const container = e.currentTarget.parentElement
          if (container) {
            container.innerHTML = renderTextWatermark().props.children
          }
        }}
      />
    </div>
  )
}
