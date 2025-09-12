// useAppState.ts - Centralized state management hook
// Manages all application state variables in one place

import { useState } from 'react'
import type { Region, Thresholds } from '../lib/calcs'
import type { Scenario } from '../data/presets'

// Default thresholds - Updated to percentage-based like Page 2
const defaultThresholds: Thresholds = {
  cprGreen: 85,      // $85 per return (excellent)
  cprYellow: 100,    // $100 per return (good)
  nimGreen: 20,      // 20% net margin (excellent) 
  nimYellow: 15,     // 15% net margin (good)
  netIncomeWarn: -5000, // Red if net income <= -$5000
}

export interface AppState {
  // UI state
  showWizard: boolean
  
  // Basic state
  region: Region
  scenario: Scenario
  avgNetFee: number
  taxPrepReturns: number
  taxRushReturns: number
  discountsPct: number
  otherIncome: number
  
  // Pre-calculated expense total from Page 2 (overrides field-based calculation)
  calculatedTotalExpenses?: number

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

  // Thresholds
  thresholds: Thresholds
}

export interface AppStateActions {
  // UI actions
  setShowWizard: (show: boolean) => void
  
  // Basic actions
  setRegion: (region: Region) => void
  setScenario: (scenario: Scenario) => void
  setANF: (value: number) => void
  setReturns: (value: number) => void
  setTaxRush: (value: number) => void
  setDisc: (value: number) => void
  setOtherIncome: (value: number) => void
  setCalculatedTotalExpenses: (value: number | undefined) => void

  // Expense actions
  setSal: (value: number) => void
  setEmpDeductions: (value: number) => void
  setRent: (value: number) => void
  setTelephone: (value: number) => void
  setUtilities: (value: number) => void
  setLocalAdv: (value: number) => void
  setInsurance: (value: number) => void
  setPostage: (value: number) => void
  setSup: (value: number) => void
  setDues: (value: number) => void
  setBankFees: (value: number) => void
  setMaintenance: (value: number) => void
  setTravelEnt: (value: number) => void
  setRoy: (value: number) => void
  setAdvRoy: (value: number) => void
  setTaxRushRoy: (value: number) => void
  setMisc: (value: number) => void

  // Threshold actions
  setThr: (thresholds: Thresholds) => void

  // Bulk actions
  resetToDefaults: () => void
  applyPreset: (preset: any) => void
  applyWizardAnswers: (answers: any) => void
}

export function useAppState(): AppState & AppStateActions {
  // UI state
  const [showWizard, setShowWizard] = useState(false)

  // Load initial region from persistence if available
  const getInitialRegion = (): Region => {
    try {
      const saved = localStorage.getItem('libertytax-pnl-webapp-v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        const region = parsed?.last?.region || parsed?.wizardAnswers?.region
        if (region === 'CA' || region === 'US') {
          console.log(`🌍 Loading saved region: ${region}`)
          return region
        }
      }
    } catch (e) {
      console.warn('Failed to load saved region, defaulting to US')
    }
    return 'US'
  }

  // Basic state
  const [region, setRegion] = useState<Region>(getInitialRegion())
  const [scenario, setScenario] = useState<Scenario>('Custom')
  const [avgNetFee, setANF] = useState(125)
  const [taxPrepReturns, setReturns] = useState(1600)
  const [taxRushReturns, setTaxRush] = useState(0)
  const [discountsPct, setDisc] = useState(3)
  const [otherIncome, setOtherIncome] = useState(0)
  const [calculatedTotalExpenses, setCalculatedTotalExpenses] = useState<number | undefined>(undefined)

  // All 17 expense fields
  const [salariesPct, setSal] = useState(25)
  const [empDeductionsPct, setEmpDeductions] = useState(10)
  const [rentPct, setRent] = useState(18)
  const [telephoneAmt, setTelephone] = useState(200)
  const [utilitiesAmt, setUtilities] = useState(300)
  const [localAdvAmt, setLocalAdv] = useState(500)
  const [insuranceAmt, setInsurance] = useState(150)
  const [postageAmt, setPostage] = useState(100)
  const [suppliesPct, setSup] = useState(3.5)
  const [duesAmt, setDues] = useState(200)
  const [bankFeesAmt, setBankFees] = useState(100)
  const [maintenanceAmt, setMaintenance] = useState(150)
  const [travelEntAmt, setTravelEnt] = useState(200)
  const [royaltiesPct, setRoy] = useState(14)
  const [advRoyaltiesPct, setAdvRoy] = useState(5)
  const [taxRushRoyaltiesPct, setTaxRushRoy] = useState(0)
  const [miscPct, setMisc] = useState(2.5)

  // Thresholds
  const [thresholds, setThr] = useState<Thresholds>(defaultThresholds)

  // Bulk actions
  const resetToDefaults = () => {
    setRegion('US')
    setScenario('Custom')
    setANF(125)
    setReturns(1600)
    setTaxRush(0)
    setDisc(3)
    
    // Reset all 17 expense fields
    setSal(25)
    setEmpDeductions(10)
    setRent(18)
    setTelephone(200)
    setUtilities(300)
    setLocalAdv(500)
    setInsurance(150)
    setPostage(100)
    setSup(3.5)
    setDues(200)
    setBankFees(100)
    setMaintenance(150)
    setTravelEnt(200)
    setRoy(14)
    setAdvRoy(5)
    setTaxRushRoy(0)
    setMisc(2.5)
    
    setThr(defaultThresholds)
    
    // Reset wizard state - close wizard if open
    setShowWizard(false)
  }

  const applyPreset = (preset: any) => {
    setANF(preset.avgNetFee)
    setReturns(preset.taxPrepReturns)
    setDisc(preset.discountsPct)
    
    // Apply all 17 expense fields
    setSal(preset.salariesPct)
    setEmpDeductions(preset.empDeductionsPct)
    setRent(preset.rentPct)
    setTelephone(preset.telephoneAmt)
    setUtilities(preset.utilitiesAmt)
    setLocalAdv(preset.localAdvAmt)
    setInsurance(preset.insuranceAmt)
    setPostage(preset.postageAmt)
    setSup(preset.suppliesPct)
    setDues(preset.duesAmt)
    setBankFees(preset.bankFeesAmt)
    setMaintenance(preset.maintenanceAmt)
    setTravelEnt(preset.travelEntAmt)
    setRoy(preset.royaltiesPct)
    setAdvRoy(preset.advRoyaltiesPct)
    setTaxRushRoy(preset.taxRushRoyaltiesPct)
    setMisc(preset.miscPct)
  }

  const applyWizardAnswers = (answers: any) => {
    console.log('🧙‍♂️ Applying wizard answers to app state:', answers)
    
    setRegion(answers.region)
    setANF(answers.avgNetFee ?? 125)
    setReturns(answers.taxPrepReturns ?? 1600)
    setDisc(answers.discountsPct ?? 3)
    // Only set otherIncome if hasOtherIncome is enabled, otherwise force to 0
    setOtherIncome(answers.hasOtherIncome ? (answers.otherIncome ?? 0) : 0)
    
    // 🔄 EXPENSE SYNC: Apply pre-calculated expense total from Page 2 if available
    if (answers.calculatedTotalExpenses !== undefined) {
      console.log('💾 Applying Page 2 calculated expense total:', answers.calculatedTotalExpenses)
      setCalculatedTotalExpenses(answers.calculatedTotalExpenses)
    }
    
    // 🐛 FIXED: Apply TaxRush data from wizard (was previously hardcoded to 0)
    const taxRushReturns = answers.region === 'CA' && answers.handlesTaxRush 
      ? (answers.taxRushReturns ?? answers.projectedTaxRushReturns ?? 0)
      : 0
    setTaxRush(taxRushReturns)
    console.log(`📊 TaxRush flow: Region=${answers.region}, handlesTaxRush=${answers.handlesTaxRush}, returns=${taxRushReturns}`)
    
    // Apply all 17 expense fields with actual wizard values (no fallbacks - trust the wizard)
    if (answers.salariesPct !== undefined) setSal(answers.salariesPct)
    if (answers.empDeductionsPct !== undefined) setEmpDeductions(answers.empDeductionsPct)
    if (answers.rentPct !== undefined) setRent(answers.rentPct)
    if (answers.telephoneAmt !== undefined) setTelephone(answers.telephoneAmt)
    if (answers.utilitiesAmt !== undefined) setUtilities(answers.utilitiesAmt)
    if (answers.localAdvAmt !== undefined) setLocalAdv(answers.localAdvAmt)
    if (answers.insuranceAmt !== undefined) setInsurance(answers.insuranceAmt)
    if (answers.postageAmt !== undefined) setPostage(answers.postageAmt)
    if (answers.suppliesPct !== undefined) setSup(answers.suppliesPct)
    if (answers.duesAmt !== undefined) setDues(answers.duesAmt)
    if (answers.bankFeesAmt !== undefined) setBankFees(answers.bankFeesAmt)
    if (answers.maintenanceAmt !== undefined) setMaintenance(answers.maintenanceAmt)
    if (answers.travelEntAmt !== undefined) setTravelEnt(answers.travelEntAmt)
    if (answers.royaltiesPct !== undefined) setRoy(answers.royaltiesPct)
    if (answers.advRoyaltiesPct !== undefined) setAdvRoy(answers.advRoyaltiesPct)
    if (answers.taxRushRoyaltiesPct !== undefined) setTaxRushRoy(answers.taxRushRoyaltiesPct)
    if (answers.miscPct !== undefined) setMisc(answers.miscPct)
    
    console.log('💰 Expense values from wizard:', {
      salariesPct: answers.salariesPct,
      empDeductionsPct: answers.empDeductionsPct,
      rentPct: answers.rentPct,
      royaltiesPct: answers.royaltiesPct,
      advRoyaltiesPct: answers.advRoyaltiesPct
    })
  }

  return {
    // State
    showWizard,
    region,
    scenario,
    avgNetFee,
    taxPrepReturns,
    taxRushReturns,
    discountsPct,
    otherIncome,
    calculatedTotalExpenses,
    salariesPct,
    empDeductionsPct,
    rentPct,
    telephoneAmt,
    utilitiesAmt,
    localAdvAmt,
    insuranceAmt,
    postageAmt,
    suppliesPct,
    duesAmt,
    bankFeesAmt,
    maintenanceAmt,
    travelEntAmt,
    royaltiesPct,
    advRoyaltiesPct,
    taxRushRoyaltiesPct,
    miscPct,
    thresholds,

    // Actions
    setShowWizard,
    setRegion,
    setScenario,
    setANF,
    setReturns,
    setTaxRush,
    setDisc,
    setOtherIncome,
    setCalculatedTotalExpenses,
    setSal,
    setEmpDeductions,
    setRent,
    setTelephone,
    setUtilities,
    setLocalAdv,
    setInsurance,
    setPostage,
    setSup,
    setDues,
    setBankFees,
    setMaintenance,
    setTravelEnt,
    setRoy,
    setAdvRoy,
    setTaxRushRoy,
    setMisc,
    setThr,

    // Bulk actions
    resetToDefaults,
    applyPreset,
    applyWizardAnswers,
  }
}
