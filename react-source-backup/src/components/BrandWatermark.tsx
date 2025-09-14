// BrandWatermark.tsx - Regional brand watermark component
// Displays centered, scrolling watermark logo with proper transparency

import React from 'react'
import { useBrandAssets, useBranding } from '../hooks/useBranding'
import type { Region } from '../lib/calcs'

interface BrandWatermarkProps {
  region: Region
}

export default function BrandWatermark({ region }: BrandWatermarkProps) {
  const assets = useBrandAssets(region)

  return (
    <div 
      className="brand-watermark"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0, // Behind all content
        pointerEvents: 'none', // Don't interfere with clicks
        opacity: 0.05, // Very subtle transparency
        userSelect: 'none' // Can't be selected
      }}
    >
      <img
        src={assets?.watermarkUrl || '/watermark.png'}
        alt={`${region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada'} watermark`}
        style={{
          width: '800px',
          height: 'auto',
          maxWidth: '70vw', // More responsive sizing - fills more space
          maxHeight: '70vh', // Taller on desktop
          minWidth: '320px', // Minimum size for mobile
          objectFit: 'contain',
          filter: 'grayscale(20%)' // Slightly reduce saturation for watermark effect
        }}
        onError={(e) => {
          // Fallback if watermark image fails to load
          console.warn(`Failed to load watermark for ${region} region`)
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}

// Optional: Alternative text-based watermark if images aren't available
export function TextWatermark({ region }: BrandWatermarkProps) {
  const { brand } = useBranding(region)

  return (
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
        whiteSpace: 'nowrap'
      }}
    >
      {brand?.name?.toUpperCase() || 'LIBERTY TAX'}
    </div>
  )
}
