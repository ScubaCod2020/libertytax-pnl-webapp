#!/usr/bin/env node

/**
 * 🛡️ VALIDATE DEBUGGING TOOLS - MAIN ENTRY POINT
 * 
 * Single command to comprehensively validate all debugging tools before using them.
 * Ensures you never use buggy debugging tools on your app.
 * 
 * "Trust but verify" - especially for debugging tools!
 * 
 * VALIDATION PHASES:
 * 1. Individual tool validation (syntax, functions, logic, performance)
 * 2. Integration testing (tools working together consistently)
 * 3. Meta-testing summary and recommendations
 * 
 * PREVENTS:
 * - Using broken debugging tools on your app
 * - False positives from buggy validation logic  
 * - Wasting time debugging debugging tools
 * - Loss of confidence in debugging results
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DebuggingToolValidator } from './debugging-tool-validator.js'
import { DebuggingToolIntegrationTester } from './debugging-tool-integration-tester.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🛡️ COMPREHENSIVE DEBUGGING TOOL VALIDATION')
console.log('==========================================\n')
console.log('🎯 Goal: Ensure debugging tools are bug-free before using them on your app')

class ComprehensiveDebuggingToolValidator {
  constructor() {
    this.validator = new DebuggingToolValidator()
    this.integrationTester = new DebuggingToolIntegrationTester()
    this.overallResults = {
      toolValidation: null,
      integrationTesting: null,
      overallHealthy: false,
      recommendations: []
    }
  }

  // Main validation workflow
  async validateAllDebuggingTools() {
    console.log('🚀 Starting comprehensive debugging tool validation...\n')
    
    // Phase 1: Individual tool validation
    console.log('📋 PHASE 1: INDIVIDUAL TOOL VALIDATION')
    console.log('======================================')
    this.overallResults.toolValidation = await this.validator.run()
    
    // Phase 2: Integration testing
    console.log('\n📋 PHASE 2: INTEGRATION TESTING')
    console.log('===============================')
    this.overallResults.integrationTesting = await this.integrationTester.run()
    
    // Phase 3: Overall assessment
    this.generateOverallAssessment()
    
    return this.overallResults
  }

  // Generate overall assessment and recommendations
  generateOverallAssessment() {
    console.log('\n🎯 OVERALL DEBUGGING TOOL HEALTH ASSESSMENT')
    console.log('==========================================')
    
    // Analyze individual tool validation results
    const toolResults = Object.values(this.overallResults.toolValidation)
    const passedTools = toolResults.filter(r => r.overall === 'passed').length
    const warningTools = toolResults.filter(r => r.overall === 'warning').length  
    const failedTools = toolResults.filter(r => r.overall === 'failed').length
    const totalTools = toolResults.length
    
    console.log(`📊 Individual Tool Health:`)
    console.log(`   ✅ Passed: ${passedTools}/${totalTools} (${Math.round(passedTools/totalTools*100)}%)`)
    console.log(`   ⚠️  Warnings: ${warningTools}/${totalTools}`)
    console.log(`   ❌ Failed: ${failedTools}/${totalTools}`)
    
    // Analyze integration testing results
    const integrationResults = this.overallResults.integrationTesting
    const consistentScenarios = integrationResults.crossValidationResults?.filter(r => r.overallConsistent).length || 0
    const totalScenarios = integrationResults.crossValidationResults?.length || 0
    
    if (totalScenarios > 0) {
      console.log(`\n🔗 Integration Health:`)
      console.log(`   🤝 Consistent: ${consistentScenarios}/${totalScenarios} (${Math.round(consistentScenarios/totalScenarios*100)}%)`)
      console.log(`   ⚠️  Inconsistent: ${totalScenarios - consistentScenarios}/${totalScenarios}`)
    }
    
    // Determine overall health
    const individualToolHealthy = failedTools === 0 && warningTools <= totalTools * 0.2 // Max 20% warnings
    const integrationHealthy = totalScenarios === 0 || consistentScenarios >= totalScenarios * 0.8 // Min 80% consistent
    
    this.overallResults.overallHealthy = individualToolHealthy && integrationHealthy
    
    // Generate specific recommendations
    this.generateRecommendations(failedTools, warningTools, totalTools, consistentScenarios, totalScenarios)
    
    // Final verdict
    console.log(`\n🏆 FINAL VERDICT:`)
    if (this.overallResults.overallHealthy) {
      console.log(`✅ DEBUGGING TOOLS ARE RELIABLE AND READY FOR USE!`)
      console.log(`🎯 Your debugging tools have been thoroughly tested and validated`)
      console.log(`🚀 Proceed with confidence - your debugging results will be accurate`)
    } else {
      console.log(`❌ DEBUGGING TOOLS HAVE ISSUES - DO NOT USE ON APP YET!`)
      console.log(`⚠️  Fix debugging tool issues before using them for app validation`)
      console.log(`🔧 Never trust debugging results from unvalidated tools`)
    }
    
    // Show recommendations
    if (this.overallResults.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`)
      this.overallResults.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`)
      })
    }
  }

  // Generate specific recommendations based on test results
  generateRecommendations(failedTools, warningTools, totalTools, consistentScenarios, totalScenarios) {
    const recommendations = []
    
    if (failedTools > 0) {
      recommendations.push(`🔧 CRITICAL: Fix ${failedTools} failed debugging tools before use`)
      recommendations.push(`📋 Review individual tool validation results for specific issues`)
      recommendations.push(`⚠️  Do not use failed tools on your app - results will be unreliable`)
    }
    
    if (warningTools > totalTools * 0.3) {
      recommendations.push(`⚠️  Consider fixing ${warningTools} tools with warnings for better reliability`)
      recommendations.push(`🧪 Test warning tools thoroughly before critical use`)
    }
    
    if (totalScenarios > 0 && consistentScenarios < totalScenarios * 0.8) {
      const inconsistentCount = totalScenarios - consistentScenarios
      recommendations.push(`🔗 Fix ${inconsistentCount} integration inconsistencies between tools`)
      recommendations.push(`📊 Ensure all debugging tools use consistent logic and data formats`)
      recommendations.push(`🔄 Standardize field mapping and validation rules across tools`)
    }
    
    if (this.overallResults.overallHealthy) {
      recommendations.push(`✅ Continue regular validation as debugging tools evolve`)
      recommendations.push(`🎯 Run validation before major releases`)
      recommendations.push(`📈 Consider automation integration for continuous validation`)
    } else {
      recommendations.push(`🚨 PRIORITY: Fix critical issues before using debugging tools on app`)
      recommendations.push(`🔧 Run emergency fixes: node scripts/automated-debug-sync/dev-workflow-integration.js emergency`)
      recommendations.push(`🔄 Re-run validation after fixes: node scripts/automated-debug-sync/validate-debugging-tools.js`)
    }
    
    this.overallResults.recommendations = recommendations
  }

  // Generate validation report file
  generateValidationReport() {
    const reportPath = path.join(__dirname, `debugging-tool-validation-report-${new Date().toISOString().split('T')[0]}.json`)
    
    const report = {
      timestamp: new Date().toISOString(),
      overallHealthy: this.overallResults.overallHealthy,
      individualTools: this.overallResults.toolValidation,
      integration: this.overallResults.integrationTesting,
      recommendations: this.overallResults.recommendations,
      summary: {
        toolsPassed: Object.values(this.overallResults.toolValidation).filter(r => r.overall === 'passed').length,
        toolsTotal: Object.keys(this.overallResults.toolValidation).length,
        integrationConsistent: this.overallResults.integrationTesting.crossValidationResults?.filter(r => r.overallConsistent).length || 0,
        integrationTotal: this.overallResults.integrationTesting.crossValidationResults?.length || 0
      }
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📋 Detailed validation report saved: ${path.basename(reportPath)}`)
    
    return reportPath
  }

  // Main execution
  async run() {
    try {
      await this.validateAllDebuggingTools()
      this.generateValidationReport()
      
      console.log('\n✨ Comprehensive debugging tool validation complete!')
      
      if (!this.overallResults.overallHealthy) {
        console.log('❌ Exiting with error code due to debugging tool issues')
        process.exit(1)
      }
      
      console.log('🎉 All debugging tools validated - ready for reliable app debugging!')
      
    } catch (error) {
      console.error('\n❌ Validation failed with error:', error.message)
      process.exit(1)
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ComprehensiveDebuggingToolValidator()
  validator.run()
}

export { ComprehensiveDebuggingToolValidator }
