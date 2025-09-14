#!/usr/bin/env node

/**
 * Automated Accessibility Audit
 * Runs comprehensive accessibility tests and creates actionable reports
 * 
 * Usage: node scripts/automated-accessibility-audit.js
 */

import { chromium } from 'playwright';
import { AxePuppeteer } from '@axe-core/playwright';
import fs from 'fs';

class AccessibilityAuditor {
  
  constructor() {
    this.browser = null;
    this.violations = [];
    this.passes = [];
    this.summary = {};
  }
  
  async setup() {
    this.browser = await chromium.launch();
  }
  
  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }
  
  /**
   * Run accessibility audit on a specific page/component
   */
  async auditPage(url, pageName = 'page') {
    const page = await this.browser.newPage();
    
    try {
      console.log(`🔍 Auditing ${pageName}: ${url}`);
      
      await page.goto(url);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Run axe accessibility tests
      const accessibilityScanResults = await new AxePuppeteer(page).analyze();
      
      // Process results
      const pageResults = {
        url,
        pageName,
        violations: accessibilityScanResults.violations,
        passes: accessibilityScanResults.passes,
        inapplicable: accessibilityScanResults.inapplicable,
        incomplete: accessibilityScanResults.incomplete,
        timestamp: new Date().toISOString()
      };
      
      this.violations.push(...pageResults.violations);
      this.passes.push(...pageResults.passes);
      
      console.log(`   • Found ${pageResults.violations.length} violations`);
      console.log(`   • Confirmed ${pageResults.passes.length} passes`);
      
      return pageResults;
      
    } finally {
      await page.close();
    }
  }
  
  /**
   * Run comprehensive audit across all key pages/states
   */
  async runComprehensiveAudit(baseUrl = 'http://localhost:4173') {
    console.log('🤖 Starting Automated Accessibility Audit');
    console.log('==========================================');
    
    const auditPages = [
      { url: baseUrl, name: 'Homepage' },
      { url: `${baseUrl}?debug=true`, name: 'Homepage with Debug Panel' },
      // Add more page states as needed
    ];
    
    const results = [];
    
    for (const pageConfig of auditPages) {
      const result = await this.auditPage(pageConfig.url, pageConfig.name);
      results.push(result);
    }
    
    // Generate summary
    this.generateSummary();
    
    return {
      results,
      summary: this.summary,
      violations: this.violations,
      passes: this.passes
    };
  }
  
  /**
   * Generate audit summary
   */
  generateSummary() {
    // Group violations by severity
    const violationsBySeverity = {
      critical: this.violations.filter(v => v.impact === 'critical'),
      serious: this.violations.filter(v => v.impact === 'serious'),
      moderate: this.violations.filter(v => v.impact === 'moderate'),
      minor: this.violations.filter(v => v.impact === 'minor')
    };
    
    // Group by rule type
    const violationsByRule = {};
    this.violations.forEach(violation => {
      if (!violationsByRule[violation.id]) {
        violationsByRule[violation.id] = [];
      }
      violationsByRule[violation.id].push(violation);
    });
    
    this.summary = {
      totalViolations: this.violations.length,
      totalPasses: this.passes.length,
      violationsBySeverity: {
        critical: violationsBySeverity.critical.length,
        serious: violationsBySeverity.serious.length,
        moderate: violationsBySeverity.moderate.length,
        minor: violationsBySeverity.minor.length
      },
      violationsByRule,
      score: this.calculateAccessibilityScore(),
      recommendations: this.generateRecommendations(violationsByRule)
    };
  }
  
  /**
   * Calculate accessibility score (0-100)
   */
  calculateAccessibilityScore() {
    const total = this.violations.length + this.passes.length;
    if (total === 0) return 100;
    
    // Weight violations by severity
    const weightedViolations = this.violations.reduce((sum, violation) => {
      const weights = { critical: 4, serious: 3, moderate: 2, minor: 1 };
      return sum + (weights[violation.impact] || 1);
    }, 0);
    
    const maxPossibleScore = total * 4; // If all were critical violations
    const score = Math.max(0, ((maxPossibleScore - weightedViolations) / maxPossibleScore) * 100);
    
    return Math.round(score);
  }
  
  /**
   * Generate actionable recommendations
   */
  generateRecommendations(violationsByRule) {
    const recommendations = [];
    
    // Priority order for common violations
    const priorityRules = [
      'color-contrast',
      'label',
      'button-name',
      'link-name',
      'heading-order',
      'landmark-one-main',
      'region',
      'bypass',
      'focus-order-semantics'
    ];
    
    priorityRules.forEach(ruleId => {
      if (violationsByRule[ruleId]) {
        const violations = violationsByRule[ruleId];
        const recommendation = this.getRecommendationForRule(ruleId, violations);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    });
    
    return recommendations;
  }
  
  /**
   * Get specific recommendation for a rule violation
   */
  getRecommendationForRule(ruleId, violations) {
    const templates = {
      'color-contrast': {
        priority: 'HIGH',
        title: 'Fix Color Contrast Issues',
        description: `${violations.length} elements have insufficient color contrast`,
        action: 'Update CSS colors to meet WCAG 2.1 AA standards (4.5:1 ratio)',
        automated: true,
        estimatedEffort: '1-2 hours'
      },
      'label': {
        priority: 'CRITICAL',
        title: 'Add Missing Form Labels',
        description: `${violations.length} form elements lack proper labels`,
        action: 'Add aria-label or associate with <label> elements',
        automated: true,
        estimatedEffort: '30 minutes'
      },
      'button-name': {
        priority: 'HIGH',
        title: 'Fix Button Accessibility Names',
        description: `${violations.length} buttons lack accessible names`,
        action: 'Add aria-label or text content to buttons',
        automated: true,
        estimatedEffort: '30 minutes'
      }
    };
    
    return templates[ruleId] || {
      priority: 'MEDIUM',
      title: `Fix ${ruleId} violations`,
      description: `${violations.length} violations found`,
      action: 'Review axe-core documentation for specific fixes',
      automated: false,
      estimatedEffort: 'Varies'
    };
  }
  
  /**
   * Generate detailed report
   */
  generateReport(auditResults) {
    const report = `# 🔍 Automated Accessibility Audit Report

**Generated**: ${new Date().toLocaleString()}
**Total Pages Audited**: ${auditResults.results.length}

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Accessibility Score** | **${auditResults.summary.score}/100** |
| Total Violations | ${auditResults.summary.totalViolations} |
| Total Passes | ${auditResults.summary.totalPasses} |

### Violations by Severity

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${auditResults.summary.violationsBySeverity.critical} |
| 🟠 Serious | ${auditResults.summary.violationsBySeverity.serious} |
| 🟡 Moderate | ${auditResults.summary.violationsBySeverity.moderate} |
| 🔵 Minor | ${auditResults.summary.violationsBySeverity.minor} |

## 🎯 Priority Recommendations

${auditResults.summary.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority} Priority)

**Description**: ${rec.description}
**Action**: ${rec.action}
**Estimated Effort**: ${rec.estimatedEffort}
**Can Be Automated**: ${rec.automated ? '✅ Yes' : '❌ Manual fix required'}

`).join('')}

## 🔧 Automated Fixes Available

The following violations can be automatically fixed:

${auditResults.summary.recommendations
  .filter(rec => rec.automated)
  .map(rec => `- ${rec.title}`)
  .join('\n')}

## 📋 Manual Review Required

${auditResults.summary.recommendations
  .filter(rec => !rec.automated)
  .map(rec => `- ${rec.title}`)
  .join('\n')}

---

*This report was generated by the Automated Accessibility Audit system.*
*For detailed violation information, check the JSON output file.*
`;

    return report;
  }
  
  /**
   * Save audit results to files
   */
  async saveResults(auditResults, outputDir = 'reports/accessibility') {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save detailed JSON results
    const jsonFile = `${outputDir}/accessibility-audit-${timestamp}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(auditResults, null, 2));
    
    // Save human-readable report
    const report = this.generateReport(auditResults);
    const reportFile = `${outputDir}/accessibility-report-${timestamp}.md`;
    fs.writeFileSync(reportFile, report);
    
    console.log(`📁 Results saved:`);
    console.log(`   • JSON: ${jsonFile}`);
    console.log(`   • Report: ${reportFile}`);
    
    return { jsonFile, reportFile };
  }
}

// CLI execution
async function main() {
  const auditor = new AccessibilityAuditor();
  
  try {
    await auditor.setup();
    
    const results = await auditor.runComprehensiveAudit();
    
    console.log('\n📊 Audit Summary:');
    console.log(`   • Accessibility Score: ${results.summary.score}/100`);
    console.log(`   • Total Violations: ${results.summary.totalViolations}`);
    console.log(`   • Critical: ${results.summary.violationsBySeverity.critical}`);
    console.log(`   • Serious: ${results.summary.violationsBySeverity.serious}`);
    
    await auditor.saveResults(results);
    
    // Exit with error code if critical violations found
    if (results.summary.violationsBySeverity.critical > 0) {
      console.log('\n🚨 CRITICAL accessibility violations found!');
      process.exit(1);
    }
    
    console.log('\n✅ Accessibility audit completed successfully!');
    
  } catch (error) {
    console.error('❌ Accessibility audit failed:', error);
    process.exit(1);
  } finally {
    await auditor.teardown();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AccessibilityAuditor };
