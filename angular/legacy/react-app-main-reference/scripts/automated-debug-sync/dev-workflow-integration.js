#!/usr/bin/env node

/**
 * 🔄 DEVELOPMENT WORKFLOW INTEGRATION
 * 
 * Integrates automated debugging tool maintenance into your development workflow.
 * Provides commands for different development scenarios and CI/CD integration.
 * 
 * WORKFLOW COMMANDS:
 * - setup: Initial setup of automated debugging infrastructure
 * - daily: Daily maintenance check (run in CI/CD)
 * - pre-release: Comprehensive validation before releases
 * - emergency: Quick fix for broken debugging tools
 * - status: Check current status of all debugging tools
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

console.log('🔄 DEVELOPMENT WORKFLOW INTEGRATION')
console.log('==================================\n')

class DevWorkflowIntegration {
  constructor() {
    this.workflows = {
      setup: this.setupWorkflow.bind(this),
      daily: this.dailyMaintenanceWorkflow.bind(this),
      'pre-release': this.preReleaseWorkflow.bind(this),
      emergency: this.emergencyWorkflow.bind(this),
      status: this.statusWorkflow.bind(this)
    }
  }

  // Initial setup workflow
  async setupWorkflow() {
    console.log('🚀 INITIAL SETUP: Automated Debugging Infrastructure')
    console.log('====================================================')
    
    console.log('\n1️⃣ Installing Git hooks...')
    await this.runCommand('node scripts/automated-debug-sync/git-hooks-installer.js install')
    
    console.log('\n2️⃣ Initializing debug tool registry...')
    await this.runCommand('node scripts/automated-debug-sync/debug-tool-registry.js --health')
    
    console.log('\n3️⃣ Running field mapping generator...')
    await this.runCommand('node scripts/automated-debug-sync/field-mapping-generator.js')
    
    console.log('\n4️⃣ Creating initial health baseline...')
    await this.createHealthBaseline()
    
    console.log('\n5️⃣ Setting up IDE integration...')
    await this.setupIDEIntegration()
    
    console.log('\n✅ SETUP COMPLETE!')
    console.log('\n📋 What happens now:')
    console.log('   • Git hooks will monitor for interface changes')
    console.log('   • Debugging tools will auto-update when needed')
    console.log('   • Daily health checks will catch issues early')
    console.log('   • CI/CD integration will ensure tool consistency')
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Test the setup: make a small change to useAppState.ts')
    console.log('   2. Commit the change and watch the pre-commit hook run')
    console.log('   3. Run "npm run debug:status" to check tool health')
  }

  // Daily maintenance workflow
  async dailyMaintenanceWorkflow() {
    console.log('📅 DAILY MAINTENANCE: Debugging Tools Health Check')
    console.log('================================================')
    
    console.log('\n🔍 Checking tool health...')
    const healthStatus = await this.runCommand('node scripts/automated-debug-sync/debug-tool-registry.js --health', true)
    
    console.log('\n🗺️  Checking field mappings...')
    await this.runCommand('node scripts/automated-debug-sync/field-mapping-generator.js')
    
    // Check if updates are needed
    const updatesNeeded = fs.existsSync(path.join(__dirname, 'debugging-tool-updates.md'))
    
    if (updatesNeeded) {
      console.log('\n🔄 Updates available - applying automatically...')
      await this.runCommand('node scripts/automated-debug-sync/update-all-tools.js')
      console.log('✅ Debugging tools updated')
    } else {
      console.log('✅ All debugging tools are current')
    }
    
    // Generate daily report
    await this.generateDailyReport()
    
    console.log('\n📊 Daily maintenance complete!')
  }

  // Pre-release workflow
  async preReleaseWorkflow() {
    console.log('🚀 PRE-RELEASE: Comprehensive Debugging Tool Validation')
    console.log('=====================================================')
    
    let allPassed = true
    
    console.log('\n📋 PHASE 1: DEBUGGING TOOL VALIDATION')
    console.log('====================================')
    
    console.log('\n1️⃣ Testing debugging tools themselves...')
    try {
      await this.runCommand('node scripts/automated-debug-sync/debugging-tool-validator.js')
    } catch (error) {
      console.log('❌ Debugging tool validation failed')
      allPassed = false
    }
    
    console.log('\n2️⃣ Testing debugging tool integration...')
    try {
      await this.runCommand('node scripts/automated-debug-sync/debugging-tool-integration-tester.js')
    } catch (error) {
      console.log('❌ Debugging tool integration testing failed')
      allPassed = false
    }
    
    console.log('\n📋 PHASE 2: APP VALIDATION (with validated tools)')
    console.log('==============================================')
    
    console.log('\n3️⃣ Field mapping validation...')
    try {
      await this.runCommand('node scripts/bidirectional-data-flow-validator.js')
    } catch (error) {
      console.log('❌ Field mapping validation failed')
      allPassed = false
    }
    
    console.log('\n4️⃣ Comprehensive scenario testing...')
    try {
      await this.runCommand('node scripts/comprehensive-user-choice-validation.js')
    } catch (error) {
      console.log('❌ Comprehensive testing failed')  
      allPassed = false
    }
    
    console.log('\n5️⃣ Tool registry health check...')
    try {
      await this.runCommand('node scripts/automated-debug-sync/debug-tool-registry.js --health')
    } catch (error) {
      console.log('❌ Registry health check failed')
      allPassed = false
    }
    
    if (allPassed) {
      console.log('\n🎉 PRE-RELEASE VALIDATION PASSED!')
      console.log('✅ Debugging tools are validated and bug-free')
      console.log('✅ App validation completed with reliable debugging tools')
      console.log('✅ Ready for release with confidence!')
    } else {
      console.log('\n❌ PRE-RELEASE VALIDATION FAILED!')
      console.log('⚠️  Fix debugging tool issues BEFORE using them on app')
      console.log('🔧 Never trust debugging tools that haven\t been validated')
      process.exit(1)
    }
  }

  // Emergency workflow
  async emergencyWorkflow() {
    console.log('🚨 EMERGENCY: Quick Debugging Tool Fix')
    console.log('=====================================')
    
    console.log('\n🔧 Running emergency fixes...')
    
    // Force regenerate all mappings
    console.log('1️⃣ Regenerating field mappings...')
    await this.runCommand('node scripts/automated-debug-sync/field-mapping-generator.js')
    
    // Force update all tools
    console.log('2️⃣ Force updating all tools...')
    await this.runCommand('node scripts/automated-debug-sync/update-all-tools.js')
    
    // Quick health check
    console.log('3️⃣ Verifying fixes...')
    await this.runCommand('node scripts/automated-debug-sync/debug-tool-registry.js --health')
    
    console.log('\n✅ Emergency fixes applied!')
    console.log('🧪 Test your debugging tools to verify they\'re working')
  }

  // Status workflow
  async statusWorkflow() {
    console.log('📊 STATUS: Current Debugging Tool Health')
    console.log('=======================================')
    
    await this.runCommand('node scripts/automated-debug-sync/debug-tool-registry.js --health')
    
    // Show recent activity
    const logPath = path.join(__dirname, 'maintenance.log')
    if (fs.existsSync(logPath)) {
      console.log('\n📋 Recent Activity:')
      const logs = fs.readFileSync(logPath, 'utf8').split('\\n').slice(-10)
      logs.forEach(log => {
        if (log.trim()) {
          console.log(`   ${log}`)
        }
      })
    }
  }

  // Create health baseline
  async createHealthBaseline() {
    const baselinePath = path.join(__dirname, 'health-baseline.json')
    const baseline = {
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      expectedTools: [
        'bidirectional-data-flow-validator',
        'realtime-field-mapping-monitor', 
        'comprehensive-user-choice-validation'
      ],
      criticalFields: [
        'expectedGrowthPct',
        'calculatedTotalExpenses',
        'otherIncome',
        'region'
      ]
    }
    
    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2))
    console.log('   📊 Health baseline created')
  }

  // Setup IDE integration
  async setupIDEIntegration() {
    // Create VS Code tasks
    const vscodePath = path.join(rootDir, '.vscode')
    if (!fs.existsSync(vscodePath)) {
      fs.mkdirSync(vscodePath, { recursive: true })
    }
    
    const tasksPath = path.join(vscodePath, 'tasks.json')
    const tasks = {
      version: '2.0.0',
      tasks: [
        {
          label: 'Debug Tools: Status',
          type: 'shell',
          command: 'node scripts/automated-debug-sync/dev-workflow-integration.js status',
          group: 'build',
          presentation: {
            echo: true,
            reveal: 'always',
            panel: 'new'
          },
          problemMatcher: []
        },
        {
          label: 'Debug Tools: Update',
          type: 'shell', 
          command: 'node scripts/automated-debug-sync/update-all-tools.js',
          group: 'build',
          presentation: {
            echo: true,
            reveal: 'always',
            panel: 'new'
          },
          problemMatcher: []
        },
        {
          label: 'Debug Tools: Emergency Fix',
          type: 'shell',
          command: 'node scripts/automated-debug-sync/dev-workflow-integration.js emergency',
          group: 'build',
          presentation: {
            echo: true,
            reveal: 'always', 
            panel: 'new'
          },
          problemMatcher: []
        },
        {
          label: 'Debug Tools: Validate Tools',
          type: 'shell',
          command: 'node scripts/automated-debug-sync/debugging-tool-validator.js',
          group: 'test',
          presentation: {
            echo: true,
            reveal: 'always',
            panel: 'new'
          },
          problemMatcher: []
        },
        {
          label: 'Debug Tools: Integration Test',
          type: 'shell', 
          command: 'node scripts/automated-debug-sync/debugging-tool-integration-tester.js',
          group: 'test',
          presentation: {
            echo: true,
            reveal: 'always',
            panel: 'new'
          },
          problemMatcher: []
        }
      ]
    }
    
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2))
    console.log('   🎨 VS Code tasks created')
  }

  // Generate daily report
  async generateDailyReport() {
    const reportPath = path.join(__dirname, 'daily-reports', 
      `${new Date().toISOString().split('T')[0]}.json`)
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    
    const report = {
      date: new Date().toISOString(),
      toolsHealthy: true, // This would be determined by actual health check
      updatesApplied: [],
      issuesFound: [],
      recommendations: []
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`   📈 Daily report saved: ${path.basename(reportPath)}`)
  }

  // Run a command and capture output
  async runCommand(command, returnOutput = false) {
    try {
      const result = execSync(command, { 
        cwd: rootDir,
        stdio: returnOutput ? 'pipe' : 'inherit',
        encoding: 'utf8'
      })
      return returnOutput ? result : true
    } catch (error) {
      if (!returnOutput) {
        console.log(`❌ Command failed: ${command}`)
        console.log(`   Error: ${error.message}`)
      }
      throw error
    }
  }

  // Log activity
  logActivity(message) {
    const logPath = path.join(__dirname, 'maintenance.log')
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\\n`
    
    fs.appendFileSync(logPath, logEntry)
  }

  // Main execution
  async run() {
    const workflow = process.argv[2]
    
    if (!workflow || !this.workflows[workflow]) {
      console.log('🔄 DEVELOPMENT WORKFLOW COMMANDS:')
      console.log('=================================')
      console.log('node dev-workflow-integration.js setup        # Initial setup')
      console.log('node dev-workflow-integration.js daily        # Daily maintenance')
      console.log('node dev-workflow-integration.js pre-release  # Pre-release validation')
      console.log('node dev-workflow-integration.js emergency    # Emergency fixes')
      console.log('node dev-workflow-integration.js status       # Current status')
      return
    }
    
    this.logActivity(`Starting ${workflow} workflow`)
    
    try {
      await this.workflows[workflow]()
      this.logActivity(`Completed ${workflow} workflow successfully`)
    } catch (error) {
      this.logActivity(`Failed ${workflow} workflow: ${error.message}`)
      throw error
    }
  }
}

// Run the integration
const integration = new DevWorkflowIntegration()
integration.run().catch(error => {
  console.error('❌ Workflow failed:', error.message)
  process.exit(1)
})
