// usePersistence.ts - Extract persistence logic from App.tsx
// Handles loading, saving, hydration, and storage management

import { useState, useEffect, useRef } from 'react'
import type { Region, Thresholds } from '../lib/calcs'
import type { Scenario } from '../data/presets'

export const APP_VERSION = 'v0.5-preview'
export const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'ssr'
export const STORAGE_KEY = `lt_pnl_v5_session_v1_${APP_VERSION}`

// DEV logging toggle
export const DEBUG = true
export const dbg = (...args: any[]) => { if (DEBUG) console.log('💾 PERSISTENCE DEBUG:', ...args) }

export type SessionState = {
  region: Region
  scenario: Scenario
  avgNetFee: number
  taxPrepReturns: number
  taxRushReturns: number
  discountsPct: number
  
  // All 17 expense fields
  salariesPct: number
  empDeductionsPct: number
  rentPct: number
  telephoneAmt: number
  utilitiesAmt: number
  localAdvAmt: number
  insuranceAmt: number
  postageAmt: number
  suppliesPct: number
  duesAmt: number
  bankFeesAmt: number
  maintenanceAmt: number
  travelEntAmt: number
  royaltiesPct: number
  advRoyaltiesPct: number
  taxRushRoyaltiesPct: number
  miscPct: number
  
  thresholds: Thresholds
}

type PersistEnvelopeV1 = {
  version: 1
  last?: SessionState
  baselines?: {
    questionnaire?: SessionState
  }
  meta?: {
    lastScenario?: SessionState['scenario']
    savedAtISO?: string
  }
}

export function usePersistence() {
  const hydratingRef = useRef(true)
  const readyRef = useRef(false)
  const settledRef = useRef(false)
  const latestSnapRef = useRef<SessionState | null>(null)

  // Storage utilities
  const loadEnvelope = (): PersistEnvelopeV1 | undefined => {
    try {
      dbg('Loading envelope from localStorage', { key: STORAGE_KEY })
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) { 
        dbg('No data found in localStorage for key:', STORAGE_KEY); 
        return 
      }
      const parsed = JSON.parse(raw) as PersistEnvelopeV1
      dbg('Successfully loaded data:', { 
        savedAt: parsed?.meta?.savedAtISO ?? '(no meta)',
        version: parsed?.version,
        hasLastSession: !!parsed?.last
      })
      if (parsed && parsed.version === 1) return parsed
    } catch (e) { 
      console.error('💾 PERSISTENCE ERROR - Failed to load:', e) 
    }
    return
  }

  const saveEnvelope = (mutator: (prev: PersistEnvelopeV1) => PersistEnvelopeV1) => {
    const prev = loadEnvelope() ?? ({ version: 1 } as PersistEnvelopeV1)
    const next = mutator(prev)
    dbg('saveEnvelope()', next?.meta?.savedAtISO ?? '(no meta)')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const clearEnvelope = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Immediate save helper
  const saveNow = () => {
    const snap = latestSnapRef.current
    if (!snap) return
    
    dbg('saveNow: writing immediately (snapshot)', snap)
    saveEnvelope(prev => ({
      ...prev,
      version: 1,
      last: snap,
      meta: { lastScenario: snap.scenario, savedAtISO: new Date().toISOString() },
    }))
  }

  // Create snapshot from current state
  const makeSnapshot = (state: Partial<SessionState>): SessionState => {
    const snap: SessionState = {
      region: state.region || 'US',
      scenario: state.scenario || 'Custom',
      avgNetFee: state.avgNetFee || 125,
      taxPrepReturns: state.taxPrepReturns || 1600,
      taxRushReturns: state.taxRushReturns || 0,
      discountsPct: state.discountsPct || 3,
      
      // All 17 expense fields
      salariesPct: state.salariesPct || 25,
      empDeductionsPct: state.empDeductionsPct || 10,
      rentPct: state.rentPct || 18,
      telephoneAmt: state.telephoneAmt || 200,
      utilitiesAmt: state.utilitiesAmt || 300,
      localAdvAmt: state.localAdvAmt || 500,
      insuranceAmt: state.insuranceAmt || 150,
      postageAmt: state.postageAmt || 100,
      suppliesPct: state.suppliesPct || 3.5,
      duesAmt: state.duesAmt || 200,
      bankFeesAmt: state.bankFeesAmt || 100,
      maintenanceAmt: state.maintenanceAmt || 150,
      travelEntAmt: state.travelEntAmt || 200,
      royaltiesPct: state.royaltiesPct || 14,
      advRoyaltiesPct: state.advRoyaltiesPct || 5,
      taxRushRoyaltiesPct: state.taxRushRoyaltiesPct || 0,
      miscPct: state.miscPct || 2.5,
      
      thresholds: state.thresholds || {
        cprGreen: 25,
        cprYellow: 35,
        nimGreen: 20,
        nimYellow: 10,
        netIncomeWarn: -5000,
      },
    }
    latestSnapRef.current = snap
    return snap
  }

  // Save baseline from wizard
  const saveBaseline = (state: Partial<SessionState>) => {
    const snap = makeSnapshot(state)
    saveEnvelope(prev => ({
      ...prev,
      version: 1,
      baselines: {
        ...prev.baselines,
        questionnaire: snap
      },
      last: snap,
      meta: { lastScenario: snap.scenario, savedAtISO: new Date().toISOString() },
    }))
  }

  // Setup autosave effect
  const setupAutosave = (dependencies: any[]) => {
    useEffect(() => {
      if (hydratingRef.current || !readyRef.current) {
        dbg('autosave: skipped (hydrating or not ready)')
        return
      }

      if (!settledRef.current) {
        settledRef.current = true
        dbg('autosave: first-ready tick (no write)')
        return
      }

      dbg('autosave: scheduled')
      const id = setTimeout(() => {
        const snap = latestSnapRef.current
        if (snap) {
          dbg('autosave: firing snapshot', snap)
          saveEnvelope(prev => ({
            version: 1,
            ...prev,
            last: snap,
            meta: { lastScenario: snap.scenario, savedAtISO: new Date().toISOString() },
          }))
        }
      }, 250)

      return () => clearTimeout(id)
    }, dependencies)
  }

  // Setup beforeunload/visibility handlers
  const setupFlushHandlers = () => {
    useEffect(() => {
      const handleBeforeUnload = () => {
        if (readyRef.current) {
          dbg('beforeunload: flush (using latestSnapRef)')
          saveNow()
        }
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    useEffect(() => {
      const handleVis = () => {
        if (document.visibilityState === 'hidden' && readyRef.current) {
          dbg('visibilitychange: hidden -> flush (using latestSnapRef)')
          saveNow()
        }
      }
      document.addEventListener('visibilitychange', handleVis)
      return () => document.removeEventListener('visibilitychange', handleVis)
    }, [])
  }

  return {
    // State refs
    hydratingRef,
    readyRef,
    settledRef,
    
    // Storage functions
    loadEnvelope,
    saveEnvelope,
    clearEnvelope,
    saveNow,
    makeSnapshot,
    saveBaseline,
    
    // Setup functions
    setupAutosave,
    setupFlushHandlers,
    
    // Constants
    STORAGE_KEY,
    ORIGIN,
    APP_VERSION,
    DEBUG,
    dbg,
  }
}
