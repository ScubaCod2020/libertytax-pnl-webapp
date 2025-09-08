// usePresets.ts - Preset management hook
// Handles preset application and region gating logic

import { useEffect, useRef } from 'react'
import { presets } from '../data/presets'
import type { AppState } from './useAppState'

export function usePresets(appState: AppState) {
  const hydratingRef = useRef(true)
  const readyRef = useRef(false)
  const taxRushDirtyRef = useRef(false)

  // Hydration effect
  useEffect(() => {
    // This would be handled by usePersistence
    // Just mark as ready for now
    requestAnimationFrame(() => {
      hydratingRef.current = false
      readyRef.current = true
    })
  }, [])

  // Preset application effect
  useEffect(() => {
    if (hydratingRef.current || !readyRef.current) return
    if (appState.scenario === 'Custom') return

    const preset = presets[appState.scenario]
    if (!preset) return

    // Check if key values already match
    if (preset.avgNetFee === appState.avgNetFee && preset.taxPrepReturns === appState.taxPrepReturns) {
      console.log('[presets] key values already match; skipping')
      return
    }

    console.log('🎯 PRESETS DEBUG - Applying preset:', {
      scenario: appState.scenario,
      preset: preset,
      previousValues: {
        avgNetFee: appState.avgNetFee,
        taxPrepReturns: appState.taxPrepReturns,
        salariesPct: appState.salariesPct,
        rentPct: appState.rentPct
      },
      region: appState.region
    })
    
    appState.applyPreset(preset)

    if (appState.region === 'US') {
      console.log('🎯 PRESETS DEBUG - US region: leaving taxRush untouched (sticky)')
    }
  }, [appState.scenario, appState.region])

  // Region gating effect
  useEffect(() => {
    console.log('🌍 REGION DEBUG - Region changed:', {
      region: appState.region,
      taxRushReturns: appState.taxRushReturns,
      willResetTaxRush: appState.region === 'US' && appState.taxRushReturns !== 0
    })
    
    if (appState.region === 'US' && appState.taxRushReturns !== 0) {
      console.log('🌍 REGION DEBUG - Resetting TaxRush to 0 for US region')
      appState.setTaxRush(0)
    }
    if (appState.region === 'US') {
      taxRushDirtyRef.current = false
    }
  }, [appState.region])

  return {
    hydratingRef,
    readyRef,
    taxRushDirtyRef,
  }
}
