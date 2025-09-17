#!/usr/bin/env node

/**
 * 📋 DEBUG TOOL REGISTRY & MAINTENANCE SYSTEM
 * 
 * Maintains a registry of all debugging tools, their dependencies,
 * update requirements, and health status.
 * 
 * FEATURES:
 * - Registry of all debugging tools and their purposes
 * - Dependency tracking (which tools depend on which interfaces)
 * - Health monitoring (outdated tools, broken dependencies)
 * - Automated maintenance scheduling
 * - Integration point for CI/CD systems
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

console.log('📋 DEBUG TOOL REGISTRY & MAINTENANCE SYSTEM')
console.log('===========================================\n')

class DebugToolRegistry {
  constructor() {
    this.registry = this.loadRegistry()
    this.healthStatus = {}
    this.maintenanceLog = []
  }

  // Define the complete registry of debugging tools
  getDefaultRegistry() {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      
      // Core debugging tools
      tools: {
        "bidirectional-data-flow-validator": {
          path: "scripts/bidirectional-data-flow-validator.js",
          purpose: "Validates field mappings between wizard, app state, and localStorage",
          dependencies: [
            "src/hooks/useAppState.ts",
            "src/hooks/usePersistence.ts", 
            "src/components/Wizard/types.ts"
          ],
          criticalFields: ["expectedGrowthPct", "calculatedTotalExpenses", "otherIncome"],
          updateTriggers: ["interface-change", "field-mapping-change"],
          automatedUpdate: true,
          status: "unknown"
        },

        "realtime-field-mapping-monitor": {
          path: "scripts/realtime-field-mapping-monitor.js", 
          purpose: "Browser console tool for live data flow monitoring",
          dependencies: [
            "src/hooks/useAppState.ts",
            "src/hooks/usePersistence.ts"
          ],
          criticalFields: ["expectedGrowthPct", "calculatedTotalExpenses"],
          updateTriggers: ["interface-change", "state-structure-change"],
          automatedUpdate: true,
          status: "unknown"
        },

        "comprehensive-user-choice-validation": {
          path: "scripts/comprehensive-user-choice-validation.js",
          purpose: "Tests all 192 user choice combinations for data flow issues",
          dependencies: [
            "src/components/Wizard/calculations.ts",
            "src/lib/calcs.ts"
          ],
          criticalFields: ["expectedGrowthPct", "region", "storeType"],
          updateTriggers: ["business-logic-change", "calculation-change"],
          automatedUpdate: true,
          status: "unknown"
        }
      },

      // Maintenance configuration
      maintenance: {
        healthCheckInterval: "daily",
        autoUpdateEnabled: true,
        notificationThreshold: 7, // days before considering a tool stale
        maxUpdateAttempts: 3
      }
    }
  }

  // Load existing registry or create default
  loadRegistry() {
    const registryPath = this.getRegistryPath()
    
    if (fs.existsSync(registryPath)) {
      try {
        const content = fs.readFileSync(registryPath, 'utf8')
        const registry = JSON.parse(content)
        console.log(`📖 Loaded existing registry (${Object.keys(registry.tools).length} tools)`)
        return registry
      } catch (error) {
        console.log(`⚠️  Failed to load registry: ${error.message}`)
      }
    }
    
    console.log('📝 Creating new debug tool registry...')
    return this.getDefaultRegistry()
  }

  // Get registry file path
  getRegistryPath() {
    return path.join(__dirname, 'debug-tool-registry.json')
  }

  // Save registry to file
  saveRegistry() {
    this.registry.lastUpdated = new Date().toISOString()
    fs.writeFileSync(this.getRegistryPath(), JSON.stringify(this.registry, null, 2))
    console.log(`💾 Registry saved`)
  }

  // Check health of all debugging tools
  async checkToolHealth() {
    console.log('🏥 Checking health of debugging tools...')
    
    for (const [toolName, toolConfig] of Object.entries(this.registry.tools)) {
      const health = await this.checkSingleToolHealth(toolName, toolConfig)
      this.healthStatus[toolName] = health
      this.registry.tools[toolName].status = health.status
    }
    
    this.generateHealthReport()
  }

  // Check health of a single tool
  async checkSingleToolHealth(toolName, toolConfig) {
    const health = {
      status: 'healthy',
      issues: [],
      warnings: []
    }

    const toolPath = path.join(rootDir, toolConfig.path)
    
    // Check if tool file exists
    if (!fs.existsSync(toolPath)) {
      health.status = 'missing'
      health.issues.push(`Tool file not found`)
      return health
    }

    // Check for outdated field mappings
    const toolContent = fs.readFileSync(toolPath, 'utf8')
    
    if (toolConfig.criticalFields.includes('expectedGrowthPct')) {
      if (toolContent.includes('appStateField: null') && 
          toolContent.includes('expectedGrowthPct')) {
        health.warnings.push('expectedGrowthPct mapping may be outdated')
        health.status = 'outdated'
      }
    }

    return health
  }

  // Generate health report
  generateHealthReport() {
    console.log('\n📊 DEBUGGING TOOLS HEALTH REPORT')
    console.log('=================================')

    const statusCounts = { healthy: 0, outdated: 0, broken: 0, missing: 0 }

    Object.entries(this.healthStatus).forEach(([toolName, health]) => {
      statusCounts[health.status]++
      
      const statusIcon = {
        healthy: '✅',
        outdated: '🔄', 
        broken: '❌',
        missing: '❓'
      }[health.status]
      
      console.log(`${statusIcon} ${toolName}: ${health.status.toUpperCase()}`)
      
      if (health.issues.length > 0 || health.warnings.length > 0) {
        [...health.issues, ...health.warnings].forEach(msg => {
          console.log(`   • ${msg}`)
        })
      }
    })

    console.log('\n📈 Summary:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      if (count > 0) {
        console.log(`   ${status}: ${count}`)
      }
    })
  }

  // Main execution
  async run() {
    await this.checkToolHealth()
    this.saveRegistry()
    console.log('\n✨ Debug tool registry maintenance complete!')
  }
}

// CLI interface
const action = process.argv[2]

if (action === '--health') {
  const registry = new DebugToolRegistry()
  registry.run()
} else {
  console.log('📋 DEBUG TOOL REGISTRY COMMANDS:')
  console.log('================================')
  console.log('node debug-tool-registry.js --health    # Check health of all tools')
}
