// Main types file - Central type definitions for the application
// This file exports all shared types across the application

import type { Region } from '../lib/calcs'

// Re-export Region type for convenience
export type { Region }

// Brand asset types
export interface BrandAssets {
  logo: string          // Main logo (stacked version)
  logoWide: string     // Wide/horizontal version  
  watermark: string    // Watermark/background logo
  favicon: string      // Favicon
  logoUrl: string      // Legacy property for compatibility
  watermarkUrl: string // Legacy property for compatibility
}

// Brand asset configuration
export type BrandConfig = {
  US: BrandAssets
  CA: BrandAssets
}

// Common application state types
export interface AppState {
  region: Region
  storeType?: 'new' | 'existing'
  // Add other global state properties as needed
}

// Expense field types
export interface ExpenseField {
  id: string
  label: string
  type: 'percentage' | 'fixed'
  category: string
  max: number
  step: number
  lockable?: boolean
  condition?: (answers: any) => boolean
}

// Suggestion system types
export interface SuggestionProfile {
  id: string
  name: string
  region: 'US' | 'CA'
  storeType: 'new' | 'existing'  
  handlesTaxRush: boolean
  suggestions: {
    avgNetFee: number
    taxPrepReturns: number
    taxRushReturns: number
    otherIncome: number
    totalExpenses: number
    salariesPct: number
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
    taxRushShortagesPct: number
    miscPct: number
    discountsPct: number
  }
}

// Re-export wizard types for convenience
export type { WizardAnswers, WizardStep, WizardSectionProps } from '../components/Wizard/types'
