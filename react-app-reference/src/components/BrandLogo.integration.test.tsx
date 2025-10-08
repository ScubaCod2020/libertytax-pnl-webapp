import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BrandLogo from './BrandLogo'
import { useBrandAssets } from '../hooks/useBranding'

// Mock the useBrandAssets hook
vi.mock('../hooks/useBranding', () => ({
  useBrandAssets: vi.fn()
}))

const mockUseBrandAssets = vi.mocked(useBrandAssets)

describe('BrandLogo Integration Tests', () => {
  it('should render with US branding assets', () => {
    mockUseBrandAssets.mockReturnValue({
      logoUrl: '/us-logo.png',
      logoWide: '/us-logo-wide.png',
      watermarkUrl: '/us-watermark.png'
    })

    render(<BrandLogo region="US" variant="standard" size="medium" />)
    
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('src', '/us-logo.png')
    expect(logo).toHaveAttribute('alt', 'Liberty Tax')
  })

  it('should render with CA branding assets', () => {
    mockUseBrandAssets.mockReturnValue({
      logoUrl: '/ca-logo.png',
      logoWide: '/ca-logo-wide.png',
      watermarkUrl: '/ca-watermark.png'
    })

    render(<BrandLogo region="CA" variant="wide" size="large" />)
    
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('src', '/ca-logo-wide.png')
    expect(logo).toHaveAttribute('alt', 'Liberty Tax Canada')
  })

  it('should handle missing assets gracefully', () => {
    mockUseBrandAssets.mockReturnValue(null)

    render(<BrandLogo region="US" variant="standard" size="medium" />)
    
    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('src', '/logo.png') // Fallback
  })

  it('should apply correct size styles', () => {
    mockUseBrandAssets.mockReturnValue({
      logoUrl: '/us-logo.png'
    })

    render(<BrandLogo region="US" variant="standard" size="small" />)
    
    const logo = screen.getByRole('img')
    expect(logo).toHaveStyle({ height: '32px', width: 'auto' })
  })
})
