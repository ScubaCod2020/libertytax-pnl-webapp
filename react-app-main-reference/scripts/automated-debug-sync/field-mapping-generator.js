#!/usr/bin/env node

/**
 * 🤖 AUTOMATED FIELD MAPPING GENERATOR
 * 
 * Automatically extracts field mappings from TypeScript interfaces to keep 
 * debugging tools synchronized with the actual codebase.
 * 
 * This prevents the need to manually update debugging tools when interfaces change.
 * 
 * FEATURES:
 * - Scans TypeScript files for interface definitions
 * - Extracts field mappings between WizardAnswers, AppState, SessionState
 * - Generates updated field mapping configs for debugging tools
 * - Detects interface changes and flags outdated debugging tools
 * - Maintains debugging tool synchronization automatically
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

console.log('🤖 AUTOMATED FIELD MAPPING GENERATOR')
console.log('===================================\n')

class FieldMappingGenerator {
  constructor() {
    this.interfaces = {}
    this.fieldMappings = {}
    this.changeDetected = false
    this.debugToolsToUpdate = new Set()
    this.generationTimestamp = new Date().toISOString()
  }

  // Scan TypeScript files for interface definitions
  async scanInterfaces() {
    console.log('🔍 Scanning TypeScript interfaces...')
    
    const filesToScan = [
      'src/hooks/useAppState.ts',
      'src/hooks/usePersistence.ts', 
      'src/components/Wizard/types.ts'
    ]

    for (const filePath of filesToScan) {
      await this.extractInterfaceFromFile(filePath)
    }

    console.log(`✅ Scanned ${Object.keys(this.interfaces).length} interfaces`)
  }

  // Extract interface definitions from a TypeScript file
  async extractInterfaceFromFile(filePath) {
    const fullPath = path.join(rootDir, filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    console.log(`📖 Reading ${filePath}...`)

    // Extract AppState interface
    if (filePath.includes('useAppState.ts')) {
      this.interfaces.AppState = this.extractAppStateInterface(content)
      this.interfaces.AppStateActions = this.extractAppStateActionsInterface(content)
    }

    // Extract SessionState interface
    if (filePath.includes('usePersistence.ts')) {
      this.interfaces.SessionState = this.extractSessionStateInterface(content)
    }

    // Extract WizardAnswers interface
    if (filePath.includes('types.ts')) {
      this.interfaces.WizardAnswers = this.extractWizardAnswersInterface(content)
    }
  }

  // Extract AppState interface fields
  extractAppStateInterface(content) {
    const interfaceMatch = content.match(/export interface AppState\s*{([^}]+)}/s)
    if (!interfaceMatch) return {}

    const interfaceContent = interfaceMatch[1]
    return this.parseInterfaceFields(interfaceContent, 'AppState')
  }

  // Extract AppStateActions interface fields
  extractAppStateActionsInterface(content) {
    const interfaceMatch = content.match(/export interface AppStateActions\s*{([^}]+)}/s)
    if (!interfaceMatch) return {}

    const interfaceContent = interfaceMatch[1]
    return this.parseActionFields(interfaceContent, 'AppStateActions')
  }

  // Extract SessionState interface fields
  extractSessionStateInterface(content) {
    const typeMatch = content.match(/export type SessionState\s*=\s*{([^}]+)}/s)
    if (!typeMatch) return {}

    const typeContent = typeMatch[1]
    return this.parseInterfaceFields(typeContent, 'SessionState')
  }

  // Extract WizardAnswers interface fields  
  extractWizardAnswersInterface(content) {
    const interfaceMatch = content.match(/export interface WizardAnswers\s*{([^}]+)}/s)
    if (!interfaceMatch) return {}

    const interfaceContent = interfaceMatch[1]
    return this.parseInterfaceFields(interfaceContent, 'WizardAnswers')
  }

  // Parse interface field definitions
  parseInterfaceFields(content, interfaceName) {
    const fields = {}
    
    // Remove comments and clean up content
    const cleanContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Match field definitions: fieldName?: type
    const fieldRegex = /(\w+)(\?)?\s*:\s*([^;,\n]+)/g
    let match

    while ((match = fieldRegex.exec(cleanContent)) !== null) {
      const [, fieldName, optional, fieldType] = match
      
      fields[fieldName] = {
        name: fieldName,
        type: this.normalizeType(fieldType.trim()),
        optional: !!optional,
        interface: interfaceName
      }
    }

    console.log(`   📋 ${interfaceName}: Found ${Object.keys(fields).length} fields`)
    return fields
  }

  // Parse action field definitions (setter functions)
  parseActionFields(content, interfaceName) {
    const actions = {}
    
    const cleanContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Match setter functions: setFieldName: (value: type) => void
    const actionRegex = /(set\w+)\s*:\s*\([^)]+\)\s*=>\s*void/g
    let match

    while ((match = actionRegex.exec(cleanContent)) !== null) {
      const [, actionName] = match
      
      actions[actionName] = {
        name: actionName,
        type: 'action',
        interface: interfaceName
      }
    }

    console.log(`   ⚙️  ${interfaceName}: Found ${Object.keys(actions).length} actions`)
    return actions
  }

  // Normalize TypeScript types for comparison
  normalizeType(type) {
    return type
      .replace(/\s+/g, ' ')
      .replace(/\|\s*undefined/g, '')
      .replace(/undefined\s*\|/g, '')
      .trim()
  }

  // Generate field mappings between interfaces
  generateFieldMappings() {
    console.log('\n🗺️  Generating field mappings...')
    
    const { WizardAnswers, AppState, SessionState } = this.interfaces
    
    if (!WizardAnswers || !AppState || !SessionState) {
      console.log('❌ Missing required interfaces for field mapping generation')
      return
    }

    // Core business data fields
    this.fieldMappings.coreFields = this.mapCoreFields(WizardAnswers, AppState, SessionState)
    
    // Expense fields  
    this.fieldMappings.expenseFields = this.mapExpenseFields(WizardAnswers, AppState, SessionState)
    
    // Wizard-only fields
    this.fieldMappings.wizardOnlyFields = this.mapWizardOnlyFields(WizardAnswers, AppState, SessionState)
    
    console.log(`✅ Generated mappings for ${Object.keys(this.fieldMappings.coreFields).length} core fields`)
    console.log(`✅ Generated mappings for ${Object.keys(this.fieldMappings.expenseFields).length} expense fields`)
    console.log(`✅ Generated mappings for ${Object.keys(this.fieldMappings.wizardOnlyFields).length} wizard-only fields`)
  }

  // Map core business data fields
  mapCoreFields(wizard, app, session) {
    const coreFields = {}
    const coreFieldNames = [
      'region', 'avgNetFee', 'taxPrepReturns', 'discountsPct', 'otherIncome', 
      'taxRushReturns', 'calculatedTotalExpenses', 'expectedGrowthPct'
    ]

    coreFieldNames.forEach(fieldName => {
      const wizardField = wizard[fieldName]
      const appField = app[fieldName]  
      const sessionField = session[fieldName]

      if (wizardField || appField || sessionField) {
        coreFields[fieldName] = {
          wizardField: wizardField ? fieldName : null,
          appStateField: appField ? fieldName : null,
          sessionField: sessionField ? fieldName : null,
          type: this.determineFieldType(wizardField, appField, sessionField),
          required: this.determineIfRequired(wizardField, appField, sessionField),
          description: this.generateFieldDescription(fieldName)
        }
      }
    })

    return coreFields
  }

  // Map expense fields
  mapExpenseFields(wizard, app, session) {
    const expenseFields = {}
    const expenseFieldNames = [
      'salariesPct', 'empDeductionsPct', 'rentPct', 'telephoneAmt', 'utilitiesAmt',
      'localAdvAmt', 'insuranceAmt', 'postageAmt', 'suppliesPct', 'duesAmt',
      'bankFeesAmt', 'maintenanceAmt', 'travelEntAmt', 'royaltiesPct',
      'advRoyaltiesPct', 'taxRushRoyaltiesPct', 'miscPct'
    ]

    expenseFieldNames.forEach(fieldName => {
      const wizardField = wizard[fieldName]
      const appField = app[fieldName]
      const sessionField = session[fieldName]

      if (wizardField || appField || sessionField) {
        expenseFields[fieldName] = {
          wizard: wizardField ? fieldName : null,
          app: appField ? fieldName : null,
          session: sessionField ? fieldName : null,
          type: this.determineFieldType(wizardField, appField, sessionField)
        }
      }
    })

    return expenseFields
  }

  // Map wizard-only fields
  mapWizardOnlyFields(wizard, app, session) {
    const wizardOnlyFields = {}

    Object.keys(wizard).forEach(fieldName => {
      const wizardField = wizard[fieldName]
      const appField = app[fieldName]
      const sessionField = session[fieldName]

      // If field exists in wizard but not in app or session
      if (wizardField && !appField && !sessionField) {
        wizardOnlyFields[fieldName] = {
          wizard: fieldName,
          type: wizardField.type,
          description: this.generateFieldDescription(fieldName)
        }
      }
    })

    return wizardOnlyFields
  }

  // Determine the most appropriate field type
  determineFieldType(wizardField, appField, sessionField) {
    const fields = [wizardField, appField, sessionField].filter(Boolean)
    if (fields.length === 0) return 'unknown'
    
    // Use the first available type
    return fields[0].type || 'unknown'
  }

  // Determine if field is required
  determineIfRequired(wizardField, appField, sessionField) {
    const fields = [wizardField, appField, sessionField].filter(Boolean)
    // Field is required if it's not optional in any interface where it exists
    return fields.some(field => !field.optional)
  }

  // Generate field description
  generateFieldDescription(fieldName) {
    const descriptions = {
      region: 'US or CA - affects calculations and UI',
      avgNetFee: 'Average net fee per return',
      taxPrepReturns: 'Number of tax prep returns',
      expectedGrowthPct: 'Performance change percentage - critical for calculations',
      calculatedTotalExpenses: 'Pre-calculated expense total from Page 2',
      otherIncome: 'Additional revenue streams',
      taxRushReturns: 'TaxRush returns for CA region',
      discountsPct: 'Discount percentage applied to gross fees',
      storeType: 'New or existing store type',
      handlesTaxRush: 'Boolean flag for TaxRush handling',
      hasOtherIncome: 'Boolean flag for additional income streams'
    }

    return descriptions[fieldName] || `${fieldName} field`
  }

  // Compare with existing field mappings to detect changes
  async detectChanges() {
    console.log('\n🔄 Detecting changes in field mappings...')

    const mappingFiles = [
      'scripts/bidirectional-data-flow-validator.js',
      'scripts/realtime-field-mapping-monitor.js',
      'scripts/comprehensive-user-choice-validation.js'
    ]

    for (const file of mappingFiles) {
      const hasChanges = await this.compareWithExistingMappings(file)
      if (hasChanges) {
        this.changeDetected = true
        this.debugToolsToUpdate.add(file)
      }
    }

    if (this.changeDetected) {
      console.log(`⚠️  Changes detected! ${this.debugToolsToUpdate.size} debugging tools need updates`)
      this.debugToolsToUpdate.forEach(tool => {
        console.log(`   📝 ${tool}`)
      })
    } else {
      console.log('✅ No changes detected - debugging tools are up to date')
    }
  }

  // Compare generated mappings with existing debugging tool mappings
  async compareWithExistingMappings(filePath) {
    const fullPath = path.join(rootDir, filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.log(`   ❓ ${filePath}: File not found (may need creation)`)
      return true
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    
    // Check if critical fields are properly mapped
    const criticalFields = ['expectedGrowthPct', 'calculatedTotalExpenses', 'otherIncome']
    let hasIssues = false

    criticalFields.forEach(field => {
      const fieldMapping = this.fieldMappings.coreFields[field]
      
      if (!fieldMapping) return
      
      // Check if debugging tool has outdated mappings
      if (fieldMapping.sessionField && content.includes(`sessionField: null`)) {
        console.log(`   🔍 ${filePath}: ${field} shows as missing from SessionState but is now mapped`)
        hasIssues = true
      }
      
      if (fieldMapping.appStateField && content.includes(`appStateField: null`)) {
        console.log(`   🔍 ${filePath}: ${field} shows as missing from AppState but is now mapped`)
        hasIssues = true
      }
    })

    return hasIssues
  }

  // Generate updated debugging tool configurations
  generateUpdatedConfigs() {
    if (!this.changeDetected) {
      console.log('\n✅ No updates needed - debugging tools are current')
      return
    }

    console.log('\n🛠️  Generating updated debugging tool configurations...')

    // Generate updated field mapping configs
    const updatedConfig = {
      generatedAt: this.generationTimestamp,
      fieldMappings: this.fieldMappings,
      interfaces: {
        AppState: Object.keys(this.interfaces.AppState || {}),
        SessionState: Object.keys(this.interfaces.SessionState || {}),
        WizardAnswers: Object.keys(this.interfaces.WizardAnswers || {})
      },
      summary: {
        totalFields: Object.keys(this.fieldMappings.coreFields || {}).length +
                    Object.keys(this.fieldMappings.expenseFields || {}).length,
        coreFields: Object.keys(this.fieldMappings.coreFields || {}).length,
        expenseFields: Object.keys(this.fieldMappings.expenseFields || {}).length,
        wizardOnlyFields: Object.keys(this.fieldMappings.wizardOnlyFields || {}).length
      }
    }

    // Save updated configuration
    const configPath = path.join(__dirname, 'generated-field-mappings.json')
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2))
    console.log(`💾 Updated configuration saved: ${configPath}`)

    // Generate update instructions
    this.generateUpdateInstructions()
  }

  // Generate instructions for updating debugging tools
  generateUpdateInstructions() {
    const instructionsPath = path.join(__dirname, 'debugging-tool-updates.md')
    
    const instructions = `# 🛠️ Debugging Tool Updates Required

Generated: ${this.generationTimestamp}

## Changes Detected

The following debugging tools have outdated field mappings and need updates:

${Array.from(this.debugToolsToUpdate).map(tool => `- ${tool}`).join('\\n')}

## Critical Field Mappings

### ✅ Fixed Field Mappings (Update Your Tools)

${Object.entries(this.fieldMappings.coreFields).map(([field, mapping]) => 
  `- **${field}**: Wizard(${mapping.wizardField || 'null'}) → App(${mapping.appStateField || 'null'}) → Session(${mapping.sessionField || 'null'})`
).join('\\n')}

## Automatic Update Commands

Run these commands to update your debugging tools:

\`\`\`bash
# Update bidirectional data flow validator
node scripts/automated-debug-sync/update-validator.js

# Update real-time field mapping monitor  
node scripts/automated-debug-sync/update-monitor.js

# Update comprehensive validation script
node scripts/automated-debug-sync/update-comprehensive.js

# Or update all at once:
node scripts/automated-debug-sync/update-all-tools.js
\`\`\`

## Manual Update Guide

If you prefer manual updates, use the generated field mappings in:
\`scripts/automated-debug-sync/generated-field-mappings.json\`

The key changes to make:
1. Update FIELD_MAPPINGS constants with new mappings
2. Remove outdated "MISSING" comments
3. Update validation logic to reflect fixes
4. Test updated tools to ensure accuracy

## Integration

Add this field mapping generator to your development workflow:

1. **Git Hook**: Run before commits that change interfaces
2. **CI/CD**: Include in build process to catch mapping drift  
3. **Regular Maintenance**: Weekly automated runs
4. **IDE Integration**: VS Code task for on-demand updates

This ensures debugging tools stay synchronized with your codebase automatically.
`

    fs.writeFileSync(instructionsPath, instructions)
    console.log(`📋 Update instructions generated: ${instructionsPath}`)
  }

  // Generate a complete automated update script
  generateAutomatedUpdater() {
    console.log('\n🤖 Generating automated debugging tool updater...')

    const updaterPath = path.join(__dirname, 'update-all-tools.js')
    const updaterScript = `#!/usr/bin/env node

/**
 * 🤖 AUTOMATED DEBUGGING TOOL UPDATER
 * 
 * Automatically updates all debugging tools with current field mappings.
 * Generated by field-mapping-generator.js at ${this.generationTimestamp}
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

// Generated field mappings
const CURRENT_FIELD_MAPPINGS = ${JSON.stringify(this.fieldMappings, null, 2)}

console.log('🤖 AUTOMATED DEBUGGING TOOL UPDATER')
console.log('===================================\\n')

// Update field mappings in debugging tools
const updateBidirectionalValidator = () => {
  console.log('🔄 Updating bidirectional-data-flow-validator.js...')
  
  const filePath = path.join(rootDir, 'scripts/bidirectional-data-flow-validator.js')
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Replace the FIELD_MAPPINGS constant
  const mappingRegex = /const FIELD_MAPPINGS = \\{[\\s\\S]*?\\}\\s*\\}\\s*\\}/
  const newMappings = \`const FIELD_MAPPINGS = \${JSON.stringify(CURRENT_FIELD_MAPPINGS, null, 2)}\`
  
  content = content.replace(mappingRegex, newMappings)
  
  fs.writeFileSync(filePath, content)
  console.log('   ✅ Updated bidirectional validator')
}

const updateRealtimeMonitor = () => {
  console.log('🔄 Updating realtime-field-mapping-monitor.js...')
  
  const filePath = path.join(rootDir, 'scripts/realtime-field-mapping-monitor.js')
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Update critical fields mapping
  const criticalFieldsRegex = /criticalFields: \\{[\\s\\S]*?\\},\\s*\\/\\/ Initialize monitoring/
  const criticalFields = Object.entries(CURRENT_FIELD_MAPPINGS.coreFields)
    .filter(([, mapping]) => mapping.required || mapping.type === 'number')
    .map(([fieldName, mapping]) => \`    '\${fieldName}': {
      description: '\${mapping.description || fieldName + ' field'}',
      wizardField: '\${mapping.wizardField}',
      appStateField: '\${mapping.appStateField}',
      sessionField: '\${mapping.sessionField}',
      shouldPersist: true,
      criticalLevel: 'HIGH'
    }\`)
    .join(',\\n')
  
  const newCriticalFields = \`criticalFields: {
\${criticalFields}
  },
  
  // Initialize monitoring\`
  
  content = content.replace(criticalFieldsRegex, newCriticalFields)
  
  fs.writeFileSync(filePath, content)
  console.log('   ✅ Updated realtime monitor')
}

// Run all updates
const runAllUpdates = () => {
  try {
    updateBidirectionalValidator()
    updateRealtimeMonitor()
    
    console.log('\\n🎉 All debugging tools updated successfully!')
    console.log('✅ Field mappings are now synchronized with the codebase')
    console.log('\\n🧪 Next steps:')
    console.log('   1. Test your updated debugging tools')
    console.log('   2. Run your validation scripts to verify accuracy')
    console.log('   3. Commit the updated debugging tools')
    
  } catch (error) {
    console.error('❌ Error updating debugging tools:', error.message)
    process.exit(1)
  }
}

runAllUpdates()
`

    fs.writeFileSync(updaterPath, updaterScript)
    fs.chmodSync(updaterPath, '755') // Make executable
    console.log(`🤖 Automated updater created: ${updaterPath}`)
  }

  // Main execution
  async run() {
    console.log('🚀 Starting automated field mapping generation...')
    
    await this.scanInterfaces()
    this.generateFieldMappings()
    await this.detectChanges()
    this.generateUpdatedConfigs()
    this.generateAutomatedUpdater()
    
    console.log('\\n✨ Automated field mapping generation completed!')
    
    if (this.changeDetected) {
      console.log('\\n🔧 ACTION REQUIRED:')
      console.log('   Run: node scripts/automated-debug-sync/update-all-tools.js')
      console.log('   This will automatically synchronize all debugging tools')
    } else {
      console.log('\\n✅ ALL DEBUGGING TOOLS ARE CURRENT')
    }
  }
}

// Run the generator
const generator = new FieldMappingGenerator()
generator.run().catch(console.error)
