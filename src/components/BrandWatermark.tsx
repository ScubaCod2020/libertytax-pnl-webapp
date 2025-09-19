// src/components/BrandWatermark.tsx
import React, { useState } from 'react'
import { useBrandAssets, useBranding } from '../hooks/useBranding'
import type { Region } from '../lib/calcs'

interface BrandWatermarkProps {
  region: Region
}

export default function BrandWatermark({ region }: BrandWatermarkProps) {
  const assets = useBrandAssets(region)
  const [imgError, setImgError] = useState(false)

  if (!assets || imgError || !assets.watermarkUrl) return <TextWatermark region={region} />

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
        onError={() => {
          console.warn(`Failed to load watermark for ${region} region`)
          setImgError(true)
        }}
      />
    </div>
  )
}

// Optional text fallback
export function TextWatermark({ region }: BrandWatermarkProps) {
  const branding = useBranding(region)
  const name = branding?.brand?.name ?? (region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada')

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
        fontWeight: 800,
        color: '#1e40af',
        letterSpacing: '0.2em',
        whiteSpace: 'nowrap',
        fontFamily: '"Proxima Nova", Arial, sans-serif',
        textTransform: 'uppercase',
      }}
    >
      {name.toUpperCase()}
    </div>
  )
}
