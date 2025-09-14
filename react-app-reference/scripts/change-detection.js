#!/usr/bin/env node

/**
 * Change Detection System
 * Monitors code changes and automatically updates tests
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

class ChangeDetector {
  constructor() {
    this.watchPaths = [
      'src/components',
      'src/lib',
      'src/hooks',
      'src/utils'
    ]
    this.testPaths = [
      'tests/shared',
      'tests/visual-regression',
      'src/**/*.test.*'
    ]
  }
  
  /**
   * Detect changes in watched paths
   */
  detectChanges() {
    console.log('🔍 Detecting changes...')
    
    const changes = {
      components: this.getChangedFiles('src/components'),
      businessLogic: this.getChangedFiles('src/lib'),
      hooks: this.getChangedFiles('src/hooks'),
      utils: this.getChangedFiles('src/utils')
    }
    
    return changes
  }
  
  /**
   * Get changed files in a directory
   */
  getChangedFiles(directory) {
    try {
      const result = execSync(`git diff --name-only HEAD~1 HEAD -- ${directory}`, { 
        encoding: 'utf8' 
      })
      return result.trim().split('\n').filter(file => file.length > 0)
    } catch (error) {
      console.log(`No changes detected in ${directory}`)
      return []
    }
  }
  
  /**
   * Analyze impact of changes
   */
  analyzeImpact(changes) {
    const impact = {
      businessLogic: false,
      uiComponents: false,
      visualRegression: false,
      e2eTests: false
    }
    
    // Check if business logic changed
    if (changes.businessLogic.length > 0) {
      impact.businessLogic = true
      console.log('⚠️  Business logic changed - shared tests may need updates')
    }
    
    // Check if UI components changed
    if (changes.components.length > 0) {
      impact.uiComponents = true
      impact.visualRegression = true
      console.log('⚠️  UI components changed - visual regression tests needed')
    }
    
    // Check if hooks changed
    if (changes.hooks.length > 0) {
      impact.uiComponents = true
      console.log('⚠️  Hooks changed - component tests may need updates')
    }
    
    return impact
  }
  
  /**
   * Generate test update recommendations
   */
  generateRecommendations(impact) {
    const recommendations = []
    
    if (impact.businessLogic) {
      recommendations.push({
        type: 'business-logic',
        action: 'Run shared business logic tests',
        command: 'npm run test:shared',
        priority: 'high'
      })
    }
    
    if (impact.uiComponents) {
      recommendations.push({
        type: 'ui-components',
        action: 'Run component tests and visual regression',
        command: 'npm run test:components && npm run test:visual',
        priority: 'high'
      })
    }
    
    if (impact.visualRegression) {
      recommendations.push({
        type: 'visual-regression',
        action: 'Update visual regression baselines',
        command: 'npm run test:visual -- --update-snapshots',
        priority: 'medium'
      })
    }
    
    return recommendations
  }
  
  /**
   * Auto-update tests based on changes
   */
  autoUpdateTests(changes, impact) {
    console.log('🤖 Auto-updating tests...')
    
    if (impact.businessLogic) {
      this.updateBusinessLogicTests(changes.businessLogic)
    }
    
    if (impact.uiComponents) {
      this.updateComponentTests(changes.components)
    }
    
    if (impact.visualRegression) {
      this.updateVisualTests(changes.components)
    }
  }
  
  /**
   * Update business logic tests
   */
  updateBusinessLogicTests(changedFiles) {
    console.log('📝 Updating business logic tests...')
    
    // This would analyze the changed files and update test expectations
    // For now, just log what would be updated
    changedFiles.forEach(file => {
      console.log(`  - Would update tests for ${file}`)
    })
  }
  
  /**
   * Update component tests
   */
  updateComponentTests(changedFiles) {
    console.log('🎨 Updating component tests...')
    
    changedFiles.forEach(file => {
      console.log(`  - Would update component tests for ${file}`)
    })
  }
  
  /**
   * Update visual tests
   */
  updateVisualTests(changedFiles) {
    console.log('📸 Updating visual regression tests...')
    
    changedFiles.forEach(file => {
      console.log(`  - Would update visual tests for ${file}`)
    })
  }
  
  /**
   * Main execution
   */
  run() {
    console.log('🚀 Change Detection System Starting...')
    
    const changes = this.detectChanges()
    const impact = this.analyzeImpact(changes)
    const recommendations = this.generateRecommendations(impact)
    
    console.log('\n📊 Change Analysis:')
    console.log(JSON.stringify(changes, null, 2))
    
    console.log('\n💡 Recommendations:')
    recommendations.forEach(rec => {
      const priority = rec.priority === 'high' ? '🔴' : '🟡'
      console.log(`${priority} ${rec.action}`)
      console.log(`   Command: ${rec.command}`)
    })
    
    // Auto-update if requested
    if (process.argv.includes('--auto-update')) {
      this.autoUpdateTests(changes, impact)
    }
    
    console.log('\n✅ Change detection complete!')
  }
}

// Run the change detector
const detector = new ChangeDetector()
detector.run()
