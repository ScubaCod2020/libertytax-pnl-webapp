// src/components/BrandLogo.tsx
import React, { useState } from 'react';
import { useBrandAssets } from '../hooks/useBranding';
import type { Region } from '../lib/calcs';

interface BrandLogoProps {
  region: Region;
  variant?: 'main' | 'wide' | 'watermark';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

export default function BrandLogo({
  region,
  variant = 'main',
  size = 'medium',
  className,
  style,
}: BrandLogoProps) {
  const assets = useBrandAssets(region);
  const [imgError, setImgError] = useState(false);

  const logoUrl = assets
    ? variant === 'wide'
      ? assets.logoWide || assets.logoUrl
      : variant === 'watermark'
        ? assets.watermarkUrl
        : assets.logoUrl
    : undefined;

  const sizeStyles: Record<NonNullable<BrandLogoProps['size']>, React.CSSProperties> = {
    small: { height: '32px', width: 'auto' },
    medium: { height: '48px', width: 'auto' },
    large: { height: '64px', width: 'auto' },
  };

  const brandName = region === 'US' ? 'Liberty Tax' : 'Liberty Tax Canada';

  // Text fallback style (Proxima Nova, uppercase, bold, Liberty blue)
  const fallbackText = (
    <div
      className={className}
      style={{
        fontFamily: '"Proxima Nova", Arial, sans-serif',
        textTransform: 'uppercase',
        fontWeight: 800,
        color: '#1e40af',
        display: 'inline-block',
        ...style,
        ...(size === 'small'
          ? { fontSize: '0.9rem' }
          : size === 'large'
            ? { fontSize: '1.3rem' }
            : { fontSize: '1.1rem' }),
      }}
    >
      {brandName}
    </div>
  );

  if (!assets || !logoUrl || imgError) return fallbackText;

  return (
    <img
      src={logoUrl}
      alt={brandName}
      className={className}
      style={{ ...sizeStyles[size], objectFit: 'contain', ...style }}
      onError={() => {
        console.warn(`Failed to load ${variant} logo for ${region} region`);
        setImgError(true);
      }}
    />
  );
}
