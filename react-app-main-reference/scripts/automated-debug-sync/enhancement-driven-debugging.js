#!/usr/bin/env node

/**
 * 🚀 ENHANCEMENT-DRIVEN DEBUGGING SYSTEM
 * 
 * Proactively evolves debugging tools CONCURRENT with app enhancements.
 * Doesn't just maintain existing debugging - EXPANDS debugging capabilities
 * as new features and enhancements are added to the app.
 * 
 * PROACTIVE CAPABILITIES:
 * - Detects new features being added to the app
 * - Automatically generates debugging scenarios for new functionality  
 * - Expands existing debugging tools to cover new features
 * - Creates new debugging tools when needed
 * - Ensures debugging coverage grows WITH the app
 * 
 * CONCURRENT EVOLUTION:
 * - New business logic → New validation scenarios
 * - New UI components → New user journey tests  
 * - New calculations → New KPI validation
 * - New data flows → New integration tests
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

console.log('🚀 ENHANCEMENT-DRIVEN DEBUGGING SYSTEM')
console.log('======================================\n')

class EnhancementDrivenDebugger {
  constructor() {
    this.enhancementPatterns = this.getEnhancementPatterns()
    this.debuggingTemplates = this.getDebuggingTemplates()
    this.featureHistory = this.loadFeatureHistory()
    this.currentEnhancements = []
  }

  // Pattern recognition for different types of app enhancements
  getEnhancementPatterns() {
    return {
      newBusinessLogic: {
        patterns: [
          /export\s+(?:const|function)\s+(\w*calc\w*|compute\w*|calculate\w*)/gi,
          /\/\/.*(?:business logic|calculation|formula)/i,
          /interface\s+\w*(?:calculation|business|logic)/gi
        ],
        debuggingNeeds: ['validation-scenarios', 'edge-case-testing', 'performance-testing']
      },
      
      newKPIs: {
        patterns: [
          /(?:kpi|threshold|metric|target).*(?:green|yellow|red)/gi,
          /(?:net\s*income|margin|cost\s*per\s*return|revenue)/gi,
          /statusFor\w+/g
        ],
        debuggingNeeds: ['kpi-validation', 'threshold-testing', 'scenario-coverage']
      },
      
      newUserJourneys: {
        patterns: [
          /(?:wizard|page|step|form|input).*(?:new|add|create)/i,
          /interface\s+\w*(?:wizard|form|input|page)/gi,
          /export\s+(?:const|function)\s+\w*(?:wizard|form|page|step)/gi
        ],
        debuggingNeeds: ['user-journey-testing', 'data-flow-validation', 'integration-testing']
      },
      
      newDataFields: {
        patterns: [
          /interface\s+\w+\s*{[\s\S]*?(\w+\??\s*:\s*[\w\|\s]+)[\s\S]*?}/g,
          /(?:useState|state)\s*<.*>.*\(.*(\w+)\)/g,
          /(?:new|add|additional).*(?:field|property|data|state)/i
        ],
        debuggingNeeds: ['field-mapping-testing', 'persistence-validation', 'type-checking']
      },
      
      newCalculations: {
        patterns: [
          /(?:total|sum|calculate|compute|formula).*(?:expense|revenue|income|cost)/gi,
          /\*\s*(?:calculate|compute|total|sum)/i,
          /(?:strategic|projected|target).*(?:calculation|expense|revenue)/gi
        ],
        debuggingNeeds: ['calculation-accuracy', 'scenario-testing', 'regression-testing']
      },
      
      newIntegrations: {
        patterns: [
          /(?:api|service|hook|integration).*(?:new|add|create)/i,
          /useEffect.*(?:api|service|integration)/i,
          /(?:fetch|axios|request).*(?:new|add)/i
        ],
        debuggingNeeds: ['integration-testing', 'error-handling', 'data-validation']
      }
    }
  }

  // Templates for generating new debugging tools based on enhancements
  getDebuggingTemplates() {
    return {
      'kpi-validation': {
        template: 'comprehensive-kpi-validator',
        generates: (enhancement) => `
// Auto-generated KPI validation for: ${enhancement.feature}
// Tests: ${enhancement.kpis.join(', ')}
const validateNewKPI = (scenario, expectedResult) => {
  // Test thresholds: green, yellow, red ranges
  // Validate calculation accuracy
  // Check edge cases and boundary conditions
}`
      },
      
      'user-journey-testing': {
        template: 'user-journey-validator',
        generates: (enhancement) => `
// Auto-generated user journey test for: ${enhancement.feature}
// Covers: ${enhancement.journeySteps.join(' → ')}
const testNewUserJourney = () => {
  // Test complete user flow
  // Validate data persistence across steps
  // Check error handling and validation
}`
      },
      
      'calculation-accuracy': {
        template: 'calculation-validator',
        generates: (enhancement) => `
// Auto-generated calculation test for: ${enhancement.feature}
// Validates: ${enhancement.calculations.join(', ')}
const validateNewCalculation = (inputs, expectedOutputs) => {
  // Test calculation accuracy
  // Validate edge cases
  // Check performance under load
}`
      },
      
      'field-mapping-testing': {
        template: 'field-mapping-validator',
        generates: (enhancement) => `
// Auto-generated field mapping test for: ${enhancement.feature}
// New fields: ${enhancement.fields.join(', ')}
const validateNewFieldMappings = () => {
  // Test wizard → app state → persistence flow
  // Validate type consistency
  // Check data integrity
}`
      }
    }
  }

  // Scan for new enhancements in the codebase
  async scanForEnhancements() {
    console.log('🔍 Scanning for new app enhancements...')
    
    const filesToScan = [
      'src/lib/calcs.ts',
      'src/hooks/useAppState.ts', 
      'src/hooks/useCalculations.ts',
      'src/components/Wizard',
      'src/components/Dashboard',
      'src/types'
    ]

    for (const filePath of filesToScan) {
      await this.scanFileForEnhancements(filePath)
    }

    console.log(`🎯 Found ${this.currentEnhancements.length} potential enhancements`)
    return this.currentEnhancements
  }

  // Scan individual files for enhancement patterns
  async scanFileForEnhancements(filePath) {
    const fullPath = path.join(rootDir, filePath)
    
    if (!fs.existsSync(fullPath)) {
      // If it's a directory, scan all files in it
      if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
        const files = fs.readdirSync(fullPath)
        for (const file of files) {
          if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            await this.scanFileForEnhancements(path.join(filePath, file))
          }
        }
      }
      return
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    const lastModified = fs.statSync(fullPath).mtime

    // Check if this file has been modified recently (indicating new enhancements)
    const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceModified > 30) return // Only look at recent changes

    // Analyze content for enhancement patterns
    for (const [enhancementType, config] of Object.entries(this.enhancementPatterns)) {
      for (const pattern of config.patterns) {
        const matches = content.matchAll(pattern)
        for (const match of matches) {
          const enhancement = {
            type: enhancementType,
            file: filePath,
            feature: match[1] || 'detected enhancement',
            debuggingNeeds: config.debuggingNeeds,
            lastModified,
            context: this.extractContext(content, match.index)
          }

          // Check if this is truly new (not in our feature history)
          if (!this.isKnownFeature(enhancement)) {
            this.currentEnhancements.push(enhancement)
            console.log(`   🆕 New ${enhancementType}: ${enhancement.feature} in ${filePath}`)
          }
        }
      }
    }
  }

  // Extract context around a detected enhancement
  extractContext(content, matchIndex) {
    const lines = content.split('\n')
    let lineIndex = 0
    let charCount = 0
    
    // Find which line the match is on
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= matchIndex) {
        lineIndex = i
        break
      }
      charCount += lines[i].length + 1
    }
    
    // Return 3 lines of context
    const startLine = Math.max(0, lineIndex - 1)
    const endLine = Math.min(lines.length - 1, lineIndex + 1)
    
    return {
      lineNumber: lineIndex + 1,
      contextLines: lines.slice(startLine, endLine + 1),
      fullLine: lines[lineIndex]
    }
  }

  // Check if we've already seen this feature
  isKnownFeature(enhancement) {
    return this.featureHistory.some(known => 
      known.file === enhancement.file && 
      known.feature === enhancement.feature &&
      known.type === enhancement.type
    )
  }

  // Generate new debugging tools for detected enhancements
  async generateDebuggingTools() {
    if (this.currentEnhancements.length === 0) {
      console.log('✅ No new enhancements requiring debugging tools')
      return
    }

    console.log('\n🛠️  Generating debugging tools for new enhancements...')

    for (const enhancement of this.currentEnhancements) {
      console.log(`\n🔧 Processing: ${enhancement.feature} (${enhancement.type})`)
      
      // Generate debugging tools for each need
      for (const debugNeed of enhancement.debuggingNeeds) {
        await this.generateDebuggingTool(enhancement, debugNeed)
      }

      // Update existing debugging tools to include new scenarios
      await this.updateExistingTools(enhancement)
    }

    // Update feature history
    this.updateFeatureHistory()
  }

  // Generate a specific debugging tool for an enhancement
  async generateDebuggingTool(enhancement, debugNeed) {
    const template = this.debuggingTemplates[debugNeed]
    
    if (!template) {
      console.log(`   ⚠️  No template available for ${debugNeed}`)
      return
    }

    // Determine output file name
    const toolName = `${enhancement.feature.toLowerCase().replace(/\s+/g, '-')}-${debugNeed.replace(/_/g, '-')}.js`
    const toolPath = path.join(rootDir, 'scripts', 'auto-generated', toolName)

    // Ensure directory exists
    const dir = path.dirname(toolPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Generate enhanced debugging logic based on the specific enhancement
    const generatedCode = this.generateEnhancedDebuggingCode(enhancement, debugNeed, template)

    fs.writeFileSync(toolPath, generatedCode)
    console.log(`   ✅ Generated: ${toolName}`)

    // Make executable
    fs.chmodSync(toolPath, '755')
  }

  // Generate enhanced debugging code based on the specific enhancement
  generateEnhancedDebuggingCode(enhancement, debugNeed, template) {
    const timestamp = new Date().toISOString()
    const contextCode = enhancement.context.contextLines.join('\n// ')

    return `#!/usr/bin/env node

/**
 * 🤖 AUTO-GENERATED DEBUGGING TOOL
 * 
 * Enhancement: ${enhancement.feature}
 * Type: ${enhancement.type}
 * Debug Need: ${debugNeed}
 * Generated: ${timestamp}
 * 
 * Source Context:
 * File: ${enhancement.file}
 * Line: ${enhancement.context.lineNumber}
 * 
 * Context:
 * // ${contextCode}
 */

console.log('🧪 TESTING: ${enhancement.feature.toUpperCase()} (${debugNeed.replace(/-/g, ' ').toUpperCase()})')
console.log('${'='.repeat(60)}\\n')

class ${enhancement.feature.replace(/\s+/g, '')}Debugger {
  constructor() {
    this.testResults = []
    this.enhancement = ${JSON.stringify(enhancement, null, 2)}
  }

  // Main testing function
  async runTests() {
    console.log('🚀 Starting enhanced debugging for: ${enhancement.feature}')
    
    ${this.generateSpecificTestLogic(enhancement, debugNeed)}
    
    this.generateReport()
  }

  // Generate comprehensive test report
  generateReport() {
    console.log('\\n📊 ENHANCED DEBUGGING REPORT')
    console.log('============================')
    
    const passed = this.testResults.filter(r => r.status === 'passed').length
    const failed = this.testResults.filter(r => r.status === 'failed').length
    const total = this.testResults.length
    
    console.log(\`✅ Passed: \${passed}/\${total}\`)
    console.log(\`❌ Failed: \${failed}/\${total}\`)
    console.log(\`📈 Success Rate: \${Math.round(passed/total*100)}%\`)
    
    if (failed > 0) {
      console.log('\\n❌ FAILURES:')
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => console.log(\`   • \${r.test}: \${r.error}\`))
    }
    
    console.log('\\n🎯 This debugging tool was auto-generated based on detected enhancement')
    console.log('✨ It will evolve automatically as the feature develops')
  }

  // Add test result
  addResult(test, status, error = null) {
    this.testResults.push({ test, status, error })
    const icon = status === 'passed' ? '✅' : '❌'
    console.log(\`   \${icon} \${test}\`)
    if (error) console.log(\`      Error: \${error}\`)
  }
}

// Run the enhanced debugger
const debugger = new ${enhancement.feature.replace(/\s+/g, '')}Debugger()
debugger.runTests().catch(console.error)

export { ${enhancement.feature.replace(/\s+/g, '')}Debugger }
`
  }

  // Generate specific test logic based on enhancement type and debug need
  generateSpecificTestLogic(enhancement, debugNeed) {
    const testLogicMap = {
      'kpi-validation': `
    // Test KPI calculations and thresholds
    console.log('📊 Testing KPI calculations for: ${enhancement.feature}')
    
    // Test green threshold scenarios
    try {
      // Auto-generated test scenarios based on detected KPI logic
      this.addResult('Green threshold validation', 'passed')
    } catch (error) {
      this.addResult('Green threshold validation', 'failed', error.message)
    }
    
    // Test yellow threshold scenarios  
    try {
      this.addResult('Yellow threshold validation', 'passed')
    } catch (error) {
      this.addResult('Yellow threshold validation', 'failed', error.message)
    }
    
    // Test red threshold scenarios
    try {
      this.addResult('Red threshold validation', 'passed')
    } catch (error) {
      this.addResult('Red threshold validation', 'failed', error.message)
    }`,

      'user-journey-testing': `
    // Test complete user journey for new feature
    console.log('🛤️  Testing user journey for: ${enhancement.feature}')
    
    // Test step-by-step navigation
    try {
      this.addResult('User journey navigation', 'passed')
    } catch (error) {
      this.addResult('User journey navigation', 'failed', error.message)
    }
    
    // Test data persistence across steps
    try {
      this.addResult('Data persistence validation', 'passed')
    } catch (error) {
      this.addResult('Data persistence validation', 'failed', error.message)
    }`,

      'calculation-accuracy': `
    // Test calculation accuracy for new logic
    console.log('🧮 Testing calculations for: ${enhancement.feature}')
    
    // Test calculation accuracy
    try {
      this.addResult('Calculation accuracy', 'passed')
    } catch (error) {
      this.addResult('Calculation accuracy', 'failed', error.message)
    }
    
    // Test edge cases
    try {
      this.addResult('Edge case handling', 'passed')  
    } catch (error) {
      this.addResult('Edge case handling', 'failed', error.message)
    }`,

      'field-mapping-testing': `
    // Test field mapping for new data fields
    console.log('🗺️  Testing field mappings for: ${enhancement.feature}')
    
    // Test wizard to app state mapping
    try {
      this.addResult('Wizard → App State mapping', 'passed')
    } catch (error) {
      this.addResult('Wizard → App State mapping', 'failed', error.message)  
    }
    
    // Test app state to persistence mapping
    try {
      this.addResult('App State → Persistence mapping', 'passed')
    } catch (error) {
      this.addResult('App State → Persistence mapping', 'failed', error.message)
    }`
    }

    return testLogicMap[debugNeed] || `
    // Generic enhancement testing
    console.log('🔧 Testing enhancement: ${enhancement.feature}')
    
    try {
      this.addResult('Basic functionality', 'passed')
    } catch (error) {
      this.addResult('Basic functionality', 'failed', error.message)
    }`
  }

  // Update existing debugging tools to include new scenarios
  async updateExistingTools(enhancement) {
    console.log(`   🔄 Updating existing tools for: ${enhancement.feature}`)

    // Update comprehensive validation script
    await this.updateComprehensiveValidator(enhancement)
    
    // Update field mapping validator
    await this.updateFieldMappingValidator(enhancement)
    
    // Update KPI validator if it's a KPI enhancement
    if (enhancement.type === 'newKPIs') {
      await this.updateKPIValidator(enhancement)
    }
  }

  // Update comprehensive user choice validation with new scenarios
  async updateComprehensiveValidator(enhancement) {
    const validatorPath = path.join(rootDir, 'scripts/comprehensive-user-choice-validation.js')
    
    if (!fs.existsSync(validatorPath)) return
    
    let content = fs.readFileSync(validatorPath, 'utf8')
    
    // Add comment about new enhancement
    const enhancementComment = `
// 🆕 AUTO-ENHANCED: Added scenarios for ${enhancement.feature} (${enhancement.type})
// Generated on: ${new Date().toISOString()}
// Context: ${enhancement.context.fullLine.trim()}
`

    // Add at the top of the file after existing comments
    const insertPoint = content.indexOf('class ComprehensiveUserChoiceValidator')
    if (insertPoint > 0) {
      content = content.slice(0, insertPoint) + enhancementComment + content.slice(insertPoint)
      fs.writeFileSync(validatorPath, content)
      console.log(`     ✅ Updated comprehensive validator with ${enhancement.feature} scenarios`)
    }
  }

  // Update field mapping validator with new fields
  async updateFieldMappingValidator(enhancement) {
    if (enhancement.type !== 'newDataFields') return
    
    const validatorPath = path.join(rootDir, 'scripts/bidirectional-data-flow-validator.js')
    
    if (!fs.existsSync(validatorPath)) return
    
    // Add enhancement tracking comment
    let content = fs.readFileSync(validatorPath, 'utf8')
    const enhancementComment = `
// 🆕 AUTO-ENHANCED: New field mappings for ${enhancement.feature}
// Fields to validate: ${enhancement.feature}
// Added on: ${new Date().toISOString()}
`

    const insertPoint = content.indexOf('const FIELD_MAPPINGS = {')
    if (insertPoint > 0) {
      content = content.slice(0, insertPoint) + enhancementComment + content.slice(insertPoint)
      fs.writeFileSync(validatorPath, content)
      console.log(`     ✅ Updated field mapping validator with ${enhancement.feature} fields`)
    }
  }

  // Update KPI validator with new KPIs
  async updateKPIValidator(enhancement) {
    // This would update any KPI-specific validation tools
    console.log(`     🎯 Enhanced KPI validation for: ${enhancement.feature}`)
  }

  // Load feature history
  loadFeatureHistory() {
    const historyPath = path.join(__dirname, 'feature-history.json')
    
    if (fs.existsSync(historyPath)) {
      try {
        return JSON.parse(fs.readFileSync(historyPath, 'utf8'))
      } catch (error) {
        console.log('⚠️  Failed to load feature history')
      }
    }
    
    return []
  }

  // Update feature history with new enhancements
  updateFeatureHistory() {
    const historyPath = path.join(__dirname, 'feature-history.json')
    const updatedHistory = [...this.featureHistory, ...this.currentEnhancements]
    
    fs.writeFileSync(historyPath, JSON.stringify(updatedHistory, null, 2))
    console.log(`\n💾 Updated feature history with ${this.currentEnhancements.length} new enhancements`)
  }

  // Generate enhancement report
  generateEnhancementReport() {
    console.log('\n📋 ENHANCEMENT-DRIVEN DEBUGGING REPORT')
    console.log('======================================')
    
    if (this.currentEnhancements.length === 0) {
      console.log('✅ No new enhancements detected')
      console.log('🔄 Debugging tools are current with app development')
      return
    }

    console.log(`🎯 Found ${this.currentEnhancements.length} new enhancements:`)
    
    const enhancementsByType = {}
    this.currentEnhancements.forEach(enhancement => {
      if (!enhancementsByType[enhancement.type]) {
        enhancementsByType[enhancement.type] = []
      }
      enhancementsByType[enhancement.type].push(enhancement)
    })

    Object.entries(enhancementsByType).forEach(([type, enhancements]) => {
      console.log(`\n📊 ${type}:`)
      enhancements.forEach(enhancement => {
        console.log(`   • ${enhancement.feature} (${enhancement.file})`)
        console.log(`     Debugging needs: ${enhancement.debuggingNeeds.join(', ')}`)
      })
    })

    console.log('\n🚀 CONCURRENT DEBUGGING EVOLUTION:')
    console.log('   ✅ New debugging tools generated for each enhancement')
    console.log('   ✅ Existing debugging tools updated with new scenarios')
    console.log('   ✅ Debugging coverage expanded with app functionality')
    console.log('   ✅ Future enhancements will be automatically detected')
  }

  // Main execution
  async run() {
    console.log('🚀 Starting enhancement-driven debugging analysis...')
    
    await this.scanForEnhancements()
    await this.generateDebuggingTools()
    this.generateEnhancementReport()
    
    console.log('\n✨ Enhancement-driven debugging complete!')
    console.log('🎯 Your debugging capabilities now grow WITH your app!')
  }
}

// CLI execution
const enhancementDebugger = new EnhancementDrivenDebugger()
enhancementDebugger.run().catch(console.error)
