import React from 'react'
import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import BrandWatermark from '../../BrandWatermark'
import BrandLogo from '../../BrandLogo'

// Note: These shallow tests ensure components render without crashing for US/CA.
// Asset hooks are not deeply mocked here; primary goal is fallback and no-crash.

describe('Branding components', () => {
  test('BrandLogo renders without crash for US', () => {
    const { container } = render(<BrandLogo region="US" />)
    expect(container).toBeTruthy()
  })

  test('BrandLogo renders without crash for CA', () => {
    const { container } = render(<BrandLogo region="CA" />)
    expect(container).toBeTruthy()
  })

  test('BrandWatermark renders without crash for US', () => {
    const { container } = render(<BrandWatermark region="US" />)
    expect(container).toBeTruthy()
  })

  test('BrandWatermark renders without crash for CA', () => {
    const { container } = render(<BrandWatermark region="CA" />)
    expect(container).toBeTruthy()
  })
})
