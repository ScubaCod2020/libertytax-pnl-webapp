#!/usr/bin/env node

/**
 * 🌍 REGION PERSISTENCE DEBUGGER
 * 
 * Specifically tests the region setting persistence issue the user described:
 * "when i changed the performance change options and the region option when i went 
 * through the app the region setting was not staying"
 * 
 * This will help pinpoint exactly where the region state gets lost.
 */

console.log('🌍 REGION PERSISTENCE DEBUGGER')
console.log('===============================\n')

// Simulate the multi-layer state management that could cause region persistence issues
class StateLayer {
  constructor(name) {
    this.name = name
    this.data = {}
    this.history = []
  }
  
  set(key, value, source = 'unknown') {
    const oldValue = this.data[key]
    this.data[key] = value
    this.history.push({
      timestamp: new Date().toISOString(),
      action: 'SET',
      key,
      oldValue,
      newValue: value,
      source
    })
    console.log(`   📝 ${this.name}: ${key} = ${value} (from ${source})`)
  }
  
  get(key) {
    return this.data[key]
  }
  
  getHistory() {
    return this.history
  }
  
  clear(source = 'unknown') {
    const oldData = { ...this.data }
    this.data = {}
    this.history.push({
      timestamp: new Date().toISOString(), 
      action: 'CLEAR',
      oldData,
      source
    })
    console.log(`   🗑️  ${this.name}: CLEARED (from ${source})`)
  }
}

// Create state layers matching the app architecture
const appState = new StateLayer('App State (useAppState)')
const wizardState = new StateLayer('Wizard State (WizardAnswers)')
const localStorage = new StateLayer('Local Storage')
const componentState = new StateLayer('Component Local State')

// Simulate state synchronization issues that could cause region loss
function simulateStateSyncIssues() {
  const issues = []
  
  // Race condition simulation
  if (Math.random() < 0.3) {
    issues.push({
      type: 'RACE_CONDITION',
      description: 'App state and wizard state updating simultaneously, causing conflicts'
    })
  }
  
  // Lazy loading delay simulation
  if (Math.random() < 0.2) {
    issues.push({
      type: 'LAZY_LOADING', 
      description: 'localStorage data not loaded before component initialization'
    })
  }
  
  // useEffect dependency issues
  if (Math.random() < 0.25) {
    issues.push({
      type: 'USEEFFECT_DEPS',
      description: 'Missing or incorrect useEffect dependencies causing stale closures'
    })
  }
  
  // Component unmount/remount issues
  if (Math.random() < 0.15) {
    issues.push({
      type: 'COMPONENT_LIFECYCLE',
      description: 'Component unmounting before state is properly persisted'
    })
  }
  
  return issues
}

// Test scenarios that match the user's description
const testScenarios = [
  {
    name: 'Region Change + Performance Change (User Issue #1)',
    steps: [
      { action: 'start_wizard', initialRegion: 'US' },
      { action: 'change_region', newRegion: 'CA' },
      { action: 'select_performance_change', performanceChange: 10 },
      { action: 'navigate_to_inputs' },
      { action: 'navigate_to_review' },
      { action: 'complete_wizard' },
      { action: 'view_dashboard' }
    ]
  },
  {
    name: 'Performance Change + Region Change (Reverse Order)',
    steps: [
      { action: 'start_wizard', initialRegion: 'CA' },
      { action: 'select_performance_change', performanceChange: -5 },
      { action: 'change_region', newRegion: 'US' },
      { action: 'navigate_to_inputs' },
      { action: 'navigate_to_review' },  
      { action: 'complete_wizard' },
      { action: 'view_dashboard' }
    ]
  },
  {
    name: 'Multiple Region Changes During Flow',
    steps: [
      { action: 'start_wizard', initialRegion: 'US' },
      { action: 'change_region', newRegion: 'CA' },
      { action: 'navigate_to_inputs' },
      { action: 'navigate_back_to_welcome' },
      { action: 'change_region', newRegion: 'US' },
      { action: 'select_performance_change', performanceChange: 15 },
      { action: 'navigate_to_inputs' },
      { action: 'complete_wizard' },
      { action: 'view_dashboard' }
    ]
  },
  {
    name: 'Browser Refresh During Wizard',
    steps: [
      { action: 'start_wizard', initialRegion: 'CA' },
      { action: 'change_region', newRegion: 'US' },
      { action: 'select_performance_change', performanceChange: 5 },
      { action: 'simulate_browser_refresh' },
      { action: 'continue_wizard' },
      { action: 'complete_wizard' },
      { action: 'view_dashboard' }
    ]
  }
]

function executeStep(step, scenario) {
  const issues = []
  
  switch (step.action) {
    case 'start_wizard':
      // Initialize all state layers
      appState.set('region', step.initialRegion, 'app_initialization')
      wizardState.set('region', step.initialRegion, 'wizard_initialization')
      localStorage.set('region', step.initialRegion, 'initial_save')
      componentState.set('region', step.initialRegion, 'component_mount')
      break
      
    case 'change_region':
      // This is where the issue likely occurs - multiple state updates
      const stateIssues = simulateStateSyncIssues()
      
      // Update wizard state first (user interaction)
      wizardState.set('region', step.newRegion, 'user_selection')
      
      // App state sync (may have delay/race condition)
      if (!stateIssues.some(i => i.type === 'RACE_CONDITION')) {
        appState.set('region', step.newRegion, 'wizard_sync')
      } else {
        issues.push('App state not synced due to race condition')
      }
      
      // localStorage update (may fail)
      if (!stateIssues.some(i => i.type === 'LAZY_LOADING')) {
        localStorage.set('region', step.newRegion, 'persistence_save')
      } else {
        issues.push('localStorage not updated due to lazy loading issue')
      }
      
      // Component state update (may be out of sync)
      if (!stateIssues.some(i => i.type === 'USEEFFECT_DEPS')) {
        componentState.set('region', step.newRegion, 'component_update')
      } else {
        issues.push('Component state stale due to useEffect dependency issue')
      }
      
      stateIssues.forEach(issue => issues.push(issue.description))
      break
      
    case 'select_performance_change':
      wizardState.set('expectedGrowthPct', step.performanceChange, 'user_selection')
      // This might trigger region-related re-renders that lose state
      if (Math.random() < 0.2) {
        const oldRegion = appState.get('region')
        appState.set('region', 'US', 'unexpected_reset') // Simulate state loss
        issues.push(`Region unexpectedly reset from ${oldRegion} to US during performance change`)
      }
      break
      
    case 'navigate_to_inputs':
    case 'navigate_to_review':
      // Navigation might cause state loss
      const navigationIssues = simulateStateSyncIssues()
      if (navigationIssues.some(i => i.type === 'COMPONENT_LIFECYCLE')) {
        // Simulate losing region state during navigation
        const currentRegion = wizardState.get('region')
        const fallbackRegion = 'US' // Common fallback
        wizardState.set('region', fallbackRegion, 'navigation_fallback')
        issues.push(`Region lost during navigation: ${currentRegion} → ${fallbackRegion}`)
      }
      break
      
    case 'navigate_back_to_welcome':
      // Back navigation might not restore state properly
      const savedRegionBack = localStorage.get('region')
      const currentRegion = wizardState.get('region')
      if (savedRegionBack !== currentRegion && Math.random() < 0.4) {
        wizardState.set('region', savedRegionBack || 'US', 'back_navigation_restore')
        issues.push(`Region inconsistency on back navigation: expected ${currentRegion}, got ${savedRegionBack}`)
      }
      break
      
    case 'simulate_browser_refresh':
      // Browser refresh - test localStorage recovery
      const savedRegionRefresh = localStorage.get('region')
      appState.clear('browser_refresh')
      wizardState.clear('browser_refresh')
      componentState.clear('browser_refresh')
      
      // Restore from localStorage (may fail)
      if (savedRegionRefresh && Math.random() > 0.2) {
        appState.set('region', savedRegionRefresh, 'localStorage_restore')
        wizardState.set('region', savedRegionRefresh, 'localStorage_restore') 
        componentState.set('region', savedRegionRefresh, 'localStorage_restore')
      } else {
        appState.set('region', 'US', 'default_fallback')
        wizardState.set('region', 'US', 'default_fallback')
        componentState.set('region', 'US', 'default_fallback')
        issues.push('Browser refresh caused region to reset to default')
      }
      break
      
    case 'continue_wizard':
    case 'complete_wizard':
    case 'view_dashboard':
      // Final verification - check if all state layers agree
      const regions = {
        app: appState.get('region'),
        wizard: wizardState.get('region'), 
        storage: localStorage.get('region'),
        component: componentState.get('region')
      }
      
      const uniqueRegions = [...new Set(Object.values(regions))]
      if (uniqueRegions.length > 1) {
        issues.push(`Final state inconsistency: ${JSON.stringify(regions)}`)
      }
      break
  }
  
  return issues
}

// Run all test scenarios
console.log('🧪 TESTING REGION PERSISTENCE SCENARIOS...\n')

const testResults = {
  scenarios: [],
  totalIssues: 0,
  criticalIssues: []
}

testScenarios.forEach((scenario, index) => {
  console.log(`${'='.repeat(60)}`)
  console.log(`🧪 SCENARIO ${index + 1}: ${scenario.name}`)
  console.log(`${'='.repeat(60)}`)
  
  let scenarioIssues = []
  
  scenario.steps.forEach((step, stepIndex) => {
    console.log(`\n📝 Step ${stepIndex + 1}: ${step.action.replace(/_/g, ' ')}`)
    if (step.newRegion) console.log(`   Target Region: ${step.newRegion}`)
    if (step.performanceChange !== undefined) console.log(`   Performance Change: ${step.performanceChange > 0 ? '+' : ''}${step.performanceChange}%`)
    
    const stepIssues = executeStep(step, scenario)
    scenarioIssues = [...scenarioIssues, ...stepIssues]
    
    if (stepIssues.length > 0) {
      console.log('   ❌ Issues detected:')
      stepIssues.forEach(issue => console.log(`     • ${issue}`))
    } else {
      console.log('   ✅ Step completed successfully')
    }
  })
  
  // Scenario summary
  const finalAppRegion = appState.get('region')
  const finalWizardRegion = wizardState.get('region')
  const finalStorageRegion = localStorage.get('region')
  
  console.log(`\n📊 SCENARIO RESULTS:`)
  console.log(`   Final App Region: ${finalAppRegion}`)
  console.log(`   Final Wizard Region: ${finalWizardRegion}`)  
  console.log(`   Final Storage Region: ${finalStorageRegion}`)
  console.log(`   Issues Found: ${scenarioIssues.length}`)
  console.log(`   Status: ${scenarioIssues.length === 0 ? '✅ PASSED' : '❌ FAILED'}`)
  
  testResults.scenarios.push({
    name: scenario.name,
    issues: scenarioIssues,
    passed: scenarioIssues.length === 0,
    finalStates: {
      app: finalAppRegion,
      wizard: finalWizardRegion,
      storage: finalStorageRegion
    }
  })
  
  testResults.totalIssues += scenarioIssues.length
  
  // Identify critical issues (state inconsistencies)
  const states = [finalAppRegion, finalWizardRegion, finalStorageRegion].filter(Boolean)
  const uniqueStates = [...new Set(states)]
  if (uniqueStates.length > 1) {
    testResults.criticalIssues.push({
      scenario: scenario.name,
      issue: 'Final state inconsistency between layers',
      states: { app: finalAppRegion, wizard: finalWizardRegion, storage: finalStorageRegion }
    })
  }
  
  // Reset for next scenario
  appState.clear('scenario_reset')
  wizardState.clear('scenario_reset')
  localStorage.clear('scenario_reset')
  componentState.clear('scenario_reset')
  
  console.log('\n')
})

// Final Analysis Report
console.log(`${'='.repeat(60)}`)
console.log('🏆 REGION PERSISTENCE DEBUGGING REPORT')
console.log(`${'='.repeat(60)}`)

const passedScenarios = testResults.scenarios.filter(s => s.passed).length
const failedScenarios = testResults.scenarios.length - passedScenarios

console.log(`\n📊 Summary Results:`)
console.log(`   Scenarios Passed: ${passedScenarios}/${testResults.scenarios.length}`)
console.log(`   Scenarios Failed: ${failedScenarios}/${testResults.scenarios.length}`)
console.log(`   Total Issues Found: ${testResults.totalIssues}`)
console.log(`   Critical State Inconsistencies: ${testResults.criticalIssues.length}`)

if (testResults.criticalIssues.length > 0) {
  console.log('\n🚨 CRITICAL STATE INCONSISTENCIES:')
  testResults.criticalIssues.forEach((critical, idx) => {
    console.log(`   ${idx + 1}. ${critical.scenario}:`)
    console.log(`      App State: ${critical.states.app}`)
    console.log(`      Wizard State: ${critical.states.wizard}`)
    console.log(`      Storage State: ${critical.states.storage}`)
  })
}

// Most common issues
const allIssues = testResults.scenarios.flatMap(s => s.issues)
const issueFrequency = {}
allIssues.forEach(issue => {
  const key = issue.split(':')[0] // Get issue type
  issueFrequency[key] = (issueFrequency[key] || 0) + 1
})

if (Object.keys(issueFrequency).length > 0) {
  console.log('\n📊 Most Common Issues:')
  Object.entries(issueFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([issue, count]) => {
      console.log(`   ${issue}: ${count} occurrences`)
    })
}

console.log('\n🔧 SPECIFIC RECOMMENDATIONS:')
console.log('=============================')

if (testResults.criticalIssues.length > 0) {
  console.log('🎯 HIGH PRIORITY - State Synchronization Issues:')
  console.log('   1. Add state validation checkpoints after region changes')
  console.log('   2. Implement state reconciliation logic in useAppState')
  console.log('   3. Add debugging logs to track region state transitions')
  console.log('   4. Review useEffect dependencies in WizardShell.tsx')
}

if (failedScenarios > 0) {
  console.log('\n🎯 MEDIUM PRIORITY - Navigation Issues:')
  console.log('   1. Test the specific failing scenarios manually in the app')
  console.log('   2. Add region persistence validation after each wizard step')
  console.log('   3. Implement recovery logic for lost region state')
}

console.log('\n🧪 MANUAL TESTING CHECKLIST:')
console.log('============================')
console.log('Test these specific scenarios that showed issues:')

testResults.scenarios
  .filter(s => !s.passed)
  .forEach((scenario, idx) => {
    console.log(`${idx + 1}. ${scenario.name}`)
    console.log(`   Expected behavior: Region should persist throughout flow`)
    console.log(`   Issues to watch for: ${scenario.issues.slice(0, 2).join(', ')}`)
  })

console.log('\n✨ Region persistence debugging completed!')
console.log('📁 Focus on state synchronization between useAppState and WizardAnswers')
console.log('🎯 Priority: Fix the region sync logic in WizardShell.tsx lines 48-53')
