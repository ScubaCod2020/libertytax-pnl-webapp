const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_DIR = 'docs';
const OUTPUT_DIR = 'docs';

// Theme patterns to identify similar content
const THEMES = {
  'testing': {
    keywords: ['test', 'testing', 'qa', 'quality', 'checklist', 'validation', 'verify', 'spec', 'playwright', 'e2e', 'unit'],
    files: []
  },
  'development': {
    keywords: ['dev', 'development', 'setup', 'install', 'build', 'deploy', 'commit', 'git', 'workflow', 'process'],
    files: []
  },
  'architecture': {
    keywords: ['arch', 'architecture', 'component', 'structure', 'design', 'pattern', 'modular', 'system'],
    files: []
  },
  'debugging': {
    keywords: ['debug', 'debugging', 'troubleshoot', 'fix', 'issue', 'problem', 'error', 'bug'],
    files: []
  },
  'analysis': {
    keywords: ['analysis', 'analyze', 'report', 'summary', 'audit', 'review', 'assessment'],
    files: []
  },
  'session': {
    keywords: ['session', 'log', 'progress', 'accomplish', 'tonight', 'summary', 'notes'],
    files: []
  },
  'integration': {
    keywords: ['integration', 'migration', 'parity', 'react', 'angular', 'port', 'convert'],
    files: []
  },
  'deployment': {
    keywords: ['deploy', 'deployment', 'pipeline', 'release', 'production', 'staging'],
    files: []
  },
  'kpi': {
    keywords: ['kpi', 'metric', 'calculation', 'performance', 'threshold', 'band'],
    files: []
  },
  'ui-ux': {
    keywords: ['ui', 'ux', 'interface', 'design', 'style', 'branding', 'mobile', 'responsive'],
    files: []
  }
};

// Helper function to calculate theme relevance
function calculateRelevance(content, keywords) {
  const normalized = content.toLowerCase();
  let score = 0;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = normalized.match(regex);
    if (matches) {
      score += matches.length;
    }
  });
  
  return score;
}

// Main analysis function
function analyzeThemes() {
  console.log('🎯 Starting thematic analysis...\n');
  
  const files = [];
  const themeResults = {};
  
  // Initialize theme results
  Object.keys(THEMES).forEach(theme => {
    themeResults[theme] = {
      files: [],
      totalScore: 0
    };
  });
  
  // Scan all markdown files
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const fileName = item.toLowerCase();
          const filePath = fullPath;
          
          files.push({
            path: filePath,
            name: item,
            size: stat.size,
            content: content
          });
          
          // Calculate relevance for each theme
          Object.keys(THEMES).forEach(theme => {
            const keywords = THEMES[theme].keywords;
            const contentScore = calculateRelevance(content, keywords);
            const nameScore = calculateRelevance(fileName, keywords);
            const totalScore = contentScore + (nameScore * 2); // Weight filename more
            
            if (totalScore > 0) {
              themeResults[theme].files.push({
                path: filePath,
                name: item,
                score: totalScore,
                contentScore: contentScore,
                nameScore: nameScore
              });
              themeResults[theme].totalScore += totalScore;
            }
          });
          
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  scanDirectory(DOCS_DIR);
  
  // Sort files by score within each theme
  Object.keys(themeResults).forEach(theme => {
    themeResults[theme].files.sort((a, b) => b.score - a.score);
  });
  
  // Generate analysis results
  const analysisResults = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      themesAnalyzed: Object.keys(THEMES).length,
      themesWithContent: Object.keys(themeResults).filter(theme => themeResults[theme].files.length > 0).length
    },
    themes: themeResults,
    recommendations: []
  };
  
  // Generate recommendations
  Object.keys(themeResults).forEach(theme => {
    const themeData = themeResults[theme];
    if (themeData.files.length > 1) {
      const highScoreFiles = themeData.files.filter(f => f.score >= 3);
      if (highScoreFiles.length > 1) {
        analysisResults.recommendations.push({
          theme: theme,
          files: highScoreFiles.map(f => f.path),
          consolidationPotential: highScoreFiles.length,
          reason: `Multiple files (${highScoreFiles.length}) with high ${theme} relevance scores`
        });
      }
    }
  });
  
  // Write JSON results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_thematic-analysis.json'),
    JSON.stringify(analysisResults, null, 2)
  );
  
  // Generate human-readable report
  let report = `# Thematic Analysis Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  
  report += `## 📊 Summary\n\n`;
  report += `- **Total Files:** ${files.length}\n`;
  report += `- **Themes Analyzed:** ${Object.keys(THEMES).length}\n`;
  report += `- **Themes with Content:** ${analysisResults.summary.themesWithContent}\n\n`;
  
  report += `## 🎯 Consolidation Recommendations\n\n`;
  if (analysisResults.recommendations.length > 0) {
    analysisResults.recommendations.forEach(rec => {
      report += `### ${rec.theme.toUpperCase()} Theme\n`;
      report += `**Potential:** ${rec.consolidationPotential} files\n`;
      report += `**Reason:** ${rec.reason}\n\n`;
      rec.files.forEach(file => {
        report += `- \`${file}\`\n`;
      });
      report += `\n`;
    });
  } else {
    report += `No significant consolidation opportunities identified.\n\n`;
  }
  
  report += `## 📋 Theme Breakdown\n\n`;
  Object.keys(themeResults).forEach(theme => {
    const themeData = themeResults[theme];
    if (themeData.files.length > 0) {
      report += `### ${theme.toUpperCase()} (${themeData.files.length} files)\n\n`;
      themeData.files.slice(0, 10).forEach(file => { // Show top 10
        report += `- **${file.name}** (score: ${file.score})\n`;
      });
      if (themeData.files.length > 10) {
        report += `- ... and ${themeData.files.length - 10} more files\n`;
      }
      report += `\n`;
    }
  });
  
  // Write report
  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_thematic-analysis.md'),
    report
  );
  
  console.log('✅ Thematic analysis complete!');
  console.log(`📊 Analyzed ${files.length} files across ${Object.keys(THEMES).length} themes`);
  console.log(`🎯 Found ${analysisResults.recommendations.length} consolidation opportunities`);
  console.log(`\n📄 Reports written to:`);
  console.log(`   - docs/_thematic-analysis.json`);
  console.log(`   - docs/_thematic-analysis.md`);
  
  return analysisResults;
}

// Run the analysis
analyzeThemes();
