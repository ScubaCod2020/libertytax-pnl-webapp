#!/usr/bin/env node

/**
 * Canonical File Refinement Tool
 * 
 * Refines canonical file selection to separate:
 * - App-focused files (for corporate handoff)
 * - Repo/meta-focused files (for personal learning)
 */

const fs = require('fs');
const path = require('path');

// Refined canonical selection with app vs repo focus
const REFINED_CANONICALS = {
  // APP-FOCUSED (for corporate handoff)
  'app-testing': {
    canonical: 'docs/TESTING.md',
    reason: 'Main testing strategy for the app',
    focus: 'app',
    files: [
      'docs/TESTING.md',
      'docs/TESTING_SETUP.md', 
      'docs/COMPREHENSIVE_TESTING_CHECKLIST.md',
      'docs/EDGE_CASE_TESTING.md',
      'docs/MANUAL_CALCULATION_TEST_CHECKLIST.md',
      'docs/MOBILE_TESTING_GUIDE.md',
      'docs/PRE_DEPLOYMENT_CHECKLIST.md',
      'docs/parity-checklist.md',
      'docs/development-checklists/currency-input-checklist.md'
    ]
  },
  
  'app-architecture': {
    canonical: 'docs/ARCHITECTURE.md',
    reason: 'Core app architecture and design patterns',
    focus: 'app',
    files: [
      'docs/ARCHITECTURE.md',
      'docs/COMPONENTS_TREE.md',
      'docs/architecture/components-graph.md',
      'docs/DATA-FLOW-ARCHITECTURE-ANALYSIS.md',
      'docs/SPEC_ANALYSIS.md'
    ]
  },
  
  'app-development': {
    canonical: 'docs/DEVELOPMENT.md',
    reason: 'Development guide for the app',
    focus: 'app',
    files: [
      'docs/DEVELOPMENT.md',
      'docs/ENV_SETUP.md',
      'docs/NODEJS_SETUP_GUIDE.md',
      'docs/STYLE_GUIDE.md',
      'docs/FEATURE_GUIDE_Branding.md'
    ]
  },
  
  'app-kpi': {
    canonical: 'docs/kpi/README.md',
    reason: 'KPI calculations and business logic',
    focus: 'app',
    files: [
      'docs/kpi/README.md',
      'docs/kpi/rules-v2.md',
      'docs/CORRECTED_CALCULATION_ANALYSIS.md',
      'docs/MANUAL_CALCULATION_TEST_CHECKLIST.md'
    ]
  },
  
  'app-issues': {
    canonical: 'docs/KNOWN_ISSUES.md',
    reason: 'Current known issues and status',
    focus: 'app',
    files: [
      'docs/KNOWN_ISSUES.md',
      'docs/CALCULATION_BUG_REPORT.md',
      'docs/CRITICAL_QA_ISSUES.md'
    ]
  },

  // REPO/META-FOCUSED (for personal learning)
  'repo-testing-meta': {
    canonical: 'docs/AUTOMATED_TESTING_STRATEGY.md',
    reason: 'AI-powered testing methodology and insights',
    focus: 'repo',
    files: [
      'docs/AUTOMATED_TESTING_STRATEGY.md',
      'docs/PRO_TIPS_TESTING_FRAMEWORK.md',
      'docs/DEBUGGING-TOOLS-VALIDATION-SUMMARY.md',
      'docs/render-audit.md',
      'docs/testing/strategy.md'
    ]
  },
  
  'repo-debugging-meta': {
    canonical: 'docs/AUTOMATED-DEBUGGING-INFRASTRUCTURE.md',
    reason: 'Debugging methodology and tooling insights',
    focus: 'repo',
    files: [
      'docs/AUTOMATED-DEBUGGING-INFRASTRUCTURE.md',
      'docs/COMPREHENSIVE-INPUT-DEBUGGING-SUMMARY.md',
      'docs/KPI-DEBUGGING-SUMMARY.md',
      'docs/FIXES-IMPLEMENTATION-SUMMARY.md',
      'docs/debug-notes.md'
    ]
  },
  
  'repo-session-meta': {
    canonical: 'docs/SESSION_LOG.md',
    reason: 'Session logs and learning journey',
    focus: 'repo',
    files: [
      'docs/SESSION_LOG.md',
      'docs/SESSION-SUMMARY-2025-09-25.md',
      'docs/session-summary-2025-10-06.md',
      'docs/session-3-summary.md',
      'docs/TONIGHT-ACCOMPLISHMENTS.md',
      'docs/DEVELOPMENT_PROGRESS_LOG.md',
      'docs/LESSONS_LEARNED.md',
      'docs/teaching-notes.md',
      'docs/UI-UX-TUNING_NOTES.md'
    ]
  },
  
  'repo-analysis-meta': {
    canonical: 'docs/COMPREHENSIVE_ANALYSIS_SUMMARY.md',
    reason: 'Comprehensive analysis and insights',
    focus: 'repo',
    files: [
      'docs/COMPREHENSIVE_ANALYSIS_SUMMARY.md',
      'docs/CONSOLIDATED-DEPENDENCY-ANALYSIS.md',
      'docs/MIGRATION_COMPLETENESS_REPORT.md',
      'docs/OVERNIGHT_QA_REPORT.md',
      'docs/QA_ANALYSIS_REPORT.md',
      'docs/QA_SUMMARY_REPORT.md'
    ]
  },
  
  'repo-process-meta': {
    canonical: 'docs/AI_INTEGRATION_GUIDE.md',
    reason: 'AI integration and process methodology',
    focus: 'repo',
    files: [
      'docs/AI_INTEGRATION_GUIDE.md',
      'docs/VIRTUAL_TEAM_GUIDE.md',
      'docs/WIKI_GUIDE.md',
      'docs/INTEGRATION_STRATEGY.md',
      'docs/INFRASTRUCTURE_EXTRACTION_PLAN.md',
      'docs/SEQUENTIAL_WORKFLOW_STRATEGY.md',
      'docs/PRO_TIPS_RESEARCH_BACKLOG.md'
    ]
  },
  
  'repo-growth-meta': {
    canonical: 'docs/growth/2025-09-27.md',
    reason: 'Growth tracking and learning progression',
    focus: 'repo',
    files: [
      'docs/growth/2025-09-06.md',
      'docs/growth/2025-09-13.md',
      'docs/growth/2025-09-20.md',
      'docs/growth/2025-09-27.md'
    ]
  }
};

/**
 * Generate refined consolidation plan
 */
function generateRefinedPlan() {
  console.log('🔍 Generating refined canonical file selection...');
  
  const plan = {
    timestamp: new Date().toISOString(),
    appFocused: {},
    repoFocused: {},
    summary: {
      appFiles: 0,
      repoFiles: 0,
      totalReduction: 0
    }
  };
  
  for (const [themeName, theme] of Object.entries(REFINED_CANONICALS)) {
    const themeData = {
      canonical: theme.canonical,
      reason: theme.reason,
      files: theme.files,
      estimatedReduction: theme.files.length - 1
    };
    
    if (theme.focus === 'app') {
      plan.appFocused[themeName] = themeData;
      plan.summary.appFiles += theme.files.length;
    } else {
      plan.repoFocused[themeName] = themeData;
      plan.summary.repoFiles += theme.files.length;
    }
    
    plan.summary.totalReduction += themeData.estimatedReduction;
  }
  
  // Write JSON output
  fs.writeFileSync('docs/_refined-consolidation-plan.json', JSON.stringify(plan, null, 2));
  
  // Write human-readable report
  writeRefinedReport(plan);
  
  console.log('✅ Refined consolidation plan complete!');
  console.log(`📊 App-focused: ${Object.keys(plan.appFocused).length} themes, ${plan.summary.appFiles} files`);
  console.log(`📊 Repo-focused: ${Object.keys(plan.repoFocused).length} themes, ${plan.summary.repoFiles} files`);
  console.log(`📊 Total reduction: ${plan.summary.totalReduction} files`);
}

/**
 * Write human-readable refined report
 */
function writeRefinedReport(plan) {
  let report = `# Refined Documentation Consolidation Plan

**Generated:** ${plan.timestamp}  
**Purpose:** Separate app-focused vs repo/meta-focused documentation for corporate handoff vs personal learning

## Corporate Handoff Version (App-Focused)

These files should be clean, professional, and focused on the application itself:

`;

  for (const [themeName, theme] of Object.entries(plan.appFocused)) {
    report += `### ${themeName.replace('-', ' ').toUpperCase()} Theme (${theme.files.length} files)

**Canonical File:** \`${theme.canonical}\`  
**Reason:** ${theme.reason}  
**Estimated Reduction:** ${theme.estimatedReduction} files

**Files to Consolidate:**
`;

    theme.files.forEach((file, index) => {
      const isCanonical = file === theme.canonical;
      report += `${index + 1}. \`${file}\`${isCanonical ? ' **(CANONICAL)**' : ''}\n`;
    });

    report += '\n';
  }

  report += `## Personal Learning Version (Repo/Meta-Focused)

These files contain your learning journey, methodologies, and insights:

`;

  for (const [themeName, theme] of Object.entries(plan.repoFocused)) {
    report += `### ${themeName.replace('-', ' ').toUpperCase()} Theme (${theme.files.length} files)

**Canonical File:** \`${theme.canonical}\`  
**Reason:** ${theme.reason}  
**Estimated Reduction:** ${theme.estimatedReduction} files

**Files to Consolidate:**
`;

    theme.files.forEach((file, index) => {
      const isCanonical = file === theme.canonical;
      report += `${index + 1}. \`${file}\`${isCanonical ? ' **(CANONICAL)**' : ''}\n`;
    });

    report += '\n';
  }

  report += `## Implementation Strategy

### Phase 1: Corporate Version (App-Focused)
1. **Consolidate app-focused themes** into clean, professional documentation
2. **Remove PII and personal insights** from corporate version
3. **Focus on technical implementation** and business logic
4. **Create clean handoff package** for corporate servers

### Phase 2: Personal Version (Repo/Meta-Focused)  
1. **Consolidate repo/meta themes** preserving your learning journey
2. **Keep all insights, methodologies, and stumbling blocks**
3. **Maintain chronological progression** of your learning
4. **Preserve debugging processes** and problem-solving approaches

### Phase 3: Separation
1. **Create two distinct branches** or repositories
2. **Corporate branch:** Clean, professional, app-focused
3. **Personal branch:** Full journey, insights, methodologies
4. **Update references** and cross-links appropriately

## Benefits

### Corporate Version
- **Clean and professional** for experienced developers
- **Focused on app logic** and technical implementation
- **No personal learning curve** or stumbling blocks
- **Ready for handoff** to corporate team

### Personal Version
- **Complete learning journey** preserved
- **Methodologies and insights** for future projects
- **Debugging processes** and problem-solving approaches
- **Chronological progression** of skills development

## Next Steps

1. **Review canonical selections** for each theme
2. **Start with app-focused consolidation** (highest impact)
3. **Create corporate handoff package** first
4. **Then consolidate personal learning version**

---

**Total Files:** ${plan.summary.appFiles + plan.summary.repoFiles}  
**App-Focused:** ${plan.summary.appFiles} files  
**Repo-Focused:** ${plan.summary.repoFiles} files  
**Estimated Reduction:** ${plan.summary.totalReduction} files

`;

  fs.writeFileSync('docs/_refined-consolidation-plan.md', report);
}

// Run the refinement
if (require.main === module) {
  generateRefinedPlan();
}

module.exports = { generateRefinedPlan };
