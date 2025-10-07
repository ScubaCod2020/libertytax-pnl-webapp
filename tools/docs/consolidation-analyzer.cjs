#!/usr/bin/env node

/**
 * Documentation Consolidation Analyzer
 * 
 * Analyzes docs for thematic similarities and creates consolidation recommendations
 * Focuses on files that should be merged based on content themes
 */

const fs = require('fs');
const path = require('path');

// Theme patterns for consolidation
const THEME_PATTERNS = {
  'testing': {
    keywords: ['test', 'testing', 'qa', 'quality', 'validation', 'checklist', 'audit'],
    files: [],
    canonical: 'docs/TESTING.md'
  },
  'debugging': {
    keywords: ['debug', 'debugging', 'bug', 'issue', 'fix', 'troubleshoot'],
    files: [],
    canonical: 'docs/DEBUGGING.md'
  },
  'analysis': {
    keywords: ['analysis', 'summary', 'report', 'comprehensive', 'review'],
    files: [],
    canonical: 'docs/ANALYSIS.md'
  },
  'development': {
    keywords: ['development', 'dev', 'progress', 'implementation', 'migration'],
    files: [],
    canonical: 'docs/DEVELOPMENT.md'
  },
  'architecture': {
    keywords: ['architecture', 'structure', 'design', 'components', 'system'],
    files: [],
    canonical: 'docs/ARCHITECTURE.md'
  },
  'setup': {
    keywords: ['setup', 'install', 'environment', 'configuration', 'guide'],
    files: [],
    canonical: 'docs/SETUP.md'
  },
  'kpi': {
    keywords: ['kpi', 'calculation', 'metrics', 'performance', 'rules'],
    files: [],
    canonical: 'docs/KPI.md'
  },
  'session': {
    keywords: ['session', 'summary', 'log', 'accomplishments', 'notes'],
    files: [],
    canonical: 'docs/SESSION_LOG.md'
  }
};

/**
 * Extract title from markdown content
 */
function extractTitle(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

/**
 * Check if file matches theme based on filename and title
 */
function matchesTheme(filename, title, theme) {
  const text = `${filename} ${title}`.toLowerCase();
  return theme.keywords.some(keyword => text.includes(keyword));
}

/**
 * Find all markdown files
 */
function findMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyze files for thematic consolidation
 */
function analyzeConsolidation() {
  console.log('🔍 Analyzing documentation for consolidation opportunities...');
  
  // Find all markdown files
  const markdownFiles = [];
  findMarkdownFiles('docs', markdownFiles);
  
  // Add root markdown files
  const rootFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.md'))
    .map(file => path.join('.', file));
  
  markdownFiles.push(...rootFiles);
  
  console.log(`📄 Found ${markdownFiles.length} markdown files`);
  
  // Categorize files by theme
  const categorizedFiles = {};
  
  for (const filePath of markdownFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const title = extractTitle(content);
      const filename = path.basename(filePath);
      
      // Check each theme
      for (const [themeName, theme] of Object.entries(THEME_PATTERNS)) {
        if (matchesTheme(filename, title, theme)) {
          if (!categorizedFiles[themeName]) {
            categorizedFiles[themeName] = [];
          }
          
          categorizedFiles[themeName].push({
            path: filePath,
            filename,
            title,
            size: content.length,
            priority: getPriority(filePath, filename, title)
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error processing ${filePath}: ${error.message}`);
    }
  }
  
  // Generate consolidation recommendations
  generateConsolidationPlan(categorizedFiles);
}

/**
 * Determine priority for consolidation (higher = more important to keep)
 */
function getPriority(filePath, filename, title) {
  let priority = 0;
  
  // Higher priority for canonical files
  if (filename === 'README.md' || filename === 'INDEX.md') priority += 100;
  if (filename.includes('MASTER') || filename.includes('CANONICAL')) priority += 50;
  
  // Higher priority for current/active files
  if (filename.includes('CURRENT') || filename.includes('ACTIVE')) priority += 30;
  if (filename.includes('2025') || filename.includes('LATEST')) priority += 20;
  
  // Lower priority for historical/archive files
  if (filename.includes('HISTORICAL') || filename.includes('ARCHIVE')) priority -= 20;
  if (filename.includes('OLD') || filename.includes('DEPRECATED')) priority -= 30;
  
  // Lower priority for session-specific files
  if (filename.includes('SESSION') || filename.includes('SUMMARY')) priority -= 10;
  
  // Lower priority for one-off reports
  if (filename.includes('REPORT') && !filename.includes('MASTER')) priority -= 15;
  
  return priority;
}

/**
 * Generate consolidation plan
 */
function generateConsolidationPlan(categorizedFiles) {
  const consolidationPlan = {
    timestamp: new Date().toISOString(),
    themes: {}
  };
  
  for (const [themeName, files] of Object.entries(categorizedFiles)) {
    if (files.length > 1) {
      // Sort by priority (highest first)
      files.sort((a, b) => b.priority - a.priority);
      
      const canonical = files[0];
      const toMerge = files.slice(1);
      
      consolidationPlan.themes[themeName] = {
        canonical: canonical,
        toMerge: toMerge,
        totalFiles: files.length,
        estimatedReduction: files.length - 1
      };
    }
  }
  
  // Write JSON output
  fs.writeFileSync('docs/_consolidation-plan.json', JSON.stringify(consolidationPlan, null, 2));
  
  // Write human-readable report
  writeConsolidationReport(consolidationPlan);
  
  console.log('✅ Consolidation analysis complete!');
  console.log(`📊 Found ${Object.keys(consolidationPlan.themes).length} themes with consolidation opportunities`);
}

/**
 * Write human-readable consolidation report
 */
function writeConsolidationReport(plan) {
  let report = `# Documentation Consolidation Plan

**Generated:** ${plan.timestamp}  
**Purpose:** Consolidate similar documentation files to reduce confusion and improve maintainability

## Consolidation Opportunities

`;

  if (Object.keys(plan.themes).length === 0) {
    report += 'No consolidation opportunities found.\n\n';
  } else {
    for (const [themeName, theme] of Object.entries(plan.themes)) {
      report += `## ${themeName.toUpperCase()} Theme (${theme.totalFiles} files)

**Canonical File:** \`${theme.canonical.path}\`  
**Title:** ${theme.canonical.title}  
**Priority:** ${theme.canonical.priority}  
**Size:** ${theme.canonical.size} characters

### Files to Merge Into Canonical:

`;

      theme.toMerge.forEach((file, index) => {
        report += `${index + 1}. **\`${file.path}\`**\n`;
        report += `   - Title: ${file.title}\n`;
        report += `   - Priority: ${file.priority}\n`;
        report += `   - Size: ${file.size} characters\n`;
        report += `   - Action: Append unique content to canonical, then archive\n\n`;
      });

      report += `**Estimated Reduction:** ${theme.estimatedReduction} files\n\n`;
    }
  }

  report += `## Implementation Strategy

### Phase 1: Review and Validate
1. **Review each canonical file** to ensure it's the best choice
2. **Check content overlap** between canonical and files to merge
3. **Identify unique content** in each file to be merged
4. **Validate priority scores** and adjust if needed

### Phase 2: Consolidate Content
1. **Append unique sections** from merged files to canonical
2. **Maintain chronological order** where relevant
3. **Preserve important context** and decision history
4. **Update cross-references** to point to canonical file

### Phase 3: Archive and Cleanup
1. **Move merged files** to \`/_meta/archive/docs/\`
2. **Create stub files** with links to canonical (optional)
3. **Update documentation index** to reflect new structure
4. **Update any references** in other documentation

### Phase 4: Validation
1. **Test all links** to ensure they still work
2. **Verify content completeness** in canonical files
3. **Update search indexes** and documentation maps
4. **Communicate changes** to team members

## Benefits of Consolidation

- **Reduced Confusion:** Clear canonical sources for each theme
- **Easier Maintenance:** Single file to update per theme
- **Better Organization:** Logical grouping of related content
- **Improved Searchability:** Less duplicate content to search through
- **Cleaner Repository:** Fewer files in docs/ directory

## Risk Mitigation

- **Preserve History:** All original files archived, not deleted
- **Gradual Implementation:** Consolidate one theme at a time
- **Backup Strategy:** Git history preserves all changes
- **Rollback Plan:** Can restore individual files if needed

---

**Next Steps:** Review this plan and implement consolidation for high-priority themes first.

`;

  fs.writeFileSync('docs/_consolidation-plan.md', report);
}

// Run the analysis
if (require.main === module) {
  analyzeConsolidation();
}

module.exports = { analyzeConsolidation };
