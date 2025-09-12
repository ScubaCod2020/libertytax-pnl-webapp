// Utility to clear old cached threshold values from localStorage
// This ensures users get the updated strategic KPI thresholds

export function clearOldThresholds() {
  console.log('🔄 Clearing old threshold cache to apply updated KPI ranges...')
  
  try {
    // Clear the entire dashboard state to reset thresholds
    localStorage.removeItem('libertytax-pnl-app')
    localStorage.removeItem('libertytax-pnl-wizard')
    
    console.log('✅ Old thresholds cleared - new strategic ranges will apply!')
    return true
  } catch (error) {
    console.warn('⚠️ Could not clear localStorage:', error)
    return false
  }
}

// Auto-run on import during development
if (typeof window !== 'undefined' && window.localStorage) {
  clearOldThresholds()
}
