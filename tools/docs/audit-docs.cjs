#!/usr/bin/env node

/**
 * Documentation Audit Tool
 * 
 * Scans docs/ directory and loose .md files to find:
 * - Exact duplicates (by content hash)
 * - Near duplicates (by 5-gram shingles + Jaccard similarity)
 * - Unique documents
 * 
 * Outputs: docs/_docs-audit.json and docs/_docs-audit.md
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const SIMILARITY_THRESHOLD = 0.85;
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'logs',
  '_meta',
  'coverage',
  'test-results',
  'playwright-report'
];

/**
 * Normalize content for comparison
 */
function normalizeContent(content) {
  return content
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, '') // Remove code fences
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Generate 5-gram shingles
 */
function generateShingles(text, n = 5) {
  const shingles = new Set();
  for (let i = 0; i <= text.length - n; i++) {
    shingles.add(text.slice(i, i + n));
  }
  return shingles;
}

/**
 * Calculate Jaccard similarity
 */
function jaccardSimilarity(setA, setB) {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Check if path should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
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
      if (!shouldExclude(fullPath)) {
        findMarkdownFiles(fullPath, files);
      }
    } else if (item.endsWith('.md')) {
      if (!shouldExclude(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Main audit function
 */
function auditDocs() {
  console.log('🔍 Starting documentation audit...');
  
  // Find all markdown files
  const markdownFiles = [];
  
  // Scan docs/ directory
  if (fs.existsSync('docs')) {
    findMarkdownFiles('docs', markdownFiles);
  }
  
  // Scan root directory for loose .md files
  const rootFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.md') && !shouldExclude(file))
    .map(file => path.join('.', file));
  
  markdownFiles.push(...rootFiles);
  
  console.log(`📄 Found ${markdownFiles.length} markdown files`);
  
  // Process files
  const fileData = [];
  const contentHashes = new Map();
  const exactDuplicates = new Map();
  const nearDuplicates = [];
  
  for (const filePath of markdownFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const normalized = normalizeContent(content);
      const hash = crypto.createHash('md5').update(normalized).digest('hex');
      const shingles = generateShingles(normalized);
      
      const fileInfo = {
        path: filePath,
        size: content.length,
        normalizedSize: normalized.length,
        hash,
        shingles,
        title: extractTitle(content)
      };
      
      fileData.push(fileInfo);
      
      // Check for exact duplicates
      if (contentHashes.has(hash)) {
        if (!exactDuplicates.has(hash)) {
          exactDuplicates.set(hash, [contentHashes.get(hash)]);
        }
        exactDuplicates.get(hash).push(filePath);
      } else {
        contentHashes.set(hash, filePath);
      }
      
    } catch (error) {
      console.warn(`⚠️  Error processing ${filePath}: ${error.message}`);
    }
  }
  
  // Find near duplicates
  for (let i = 0; i < fileData.length; i++) {
    for (let j = i + 1; j < fileData.length; j++) {
      const similarity = jaccardSimilarity(fileData[i].shingles, fileData[j].shingles);
      
      if (similarity >= SIMILARITY_THRESHOLD) {
        nearDuplicates.push({
          file1: fileData[i].path,
          file2: fileData[j].path,
          similarity: Math.round(similarity * 100) / 100,
          title1: fileData[i].title,
          title2: fileData[j].title
        });
      }
    }
  }
  
  // Sort near duplicates by similarity (highest first)
  nearDuplicates.sort((a, b) => b.similarity - a.similarity);
  
  // Generate results
  const results = {
    timestamp: new Date().toISOString(),
    totalFiles: markdownFiles.length,
    exactDuplicates: Array.from(exactDuplicates.entries()).map(([hash, files]) => ({
      hash,
      files,
      canonical: chooseCanonical(files)
    })),
    nearDuplicates,
    unique: fileData.filter(f => !Array.from(exactDuplicates.values()).flat().includes(f.path))
  };
  
  // Write JSON output
  fs.writeFileSync('docs/_docs-audit.json', JSON.stringify(results, null, 2));
  
  // Write human-readable report
  writeHumanReport(results);
  
  console.log('✅ Documentation audit complete!');
  console.log(`📊 Results: ${results.exactDuplicates.length} exact duplicates, ${results.nearDuplicates.length} near duplicates, ${results.unique.length} unique files`);
}

/**
 * Extract title from markdown content
 */
function extractTitle(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

/**
 * Choose canonical file from duplicates
 */
function chooseCanonical(files) {
  // Prefer files linked from README
  const readmeFiles = files.filter(f => f.includes('README') || f.includes('INDEX'));
  if (readmeFiles.length > 0) {
    return readmeFiles[0];
  }
  
  // Prefer files in docs/ over root
  const docsFiles = files.filter(f => f.startsWith('docs/'));
  if (docsFiles.length > 0) {
    return docsFiles[0];
  }
  
  // Prefer shorter paths
  return files.sort((a, b) => a.length - b.length)[0];
}

/**
 * Write human-readable report
 */
function writeHumanReport(results) {
  let report = `# Documentation Audit Report

**Generated:** ${results.timestamp}  
**Total Files:** ${results.totalFiles}  
**Exact Duplicates:** ${results.exactDuplicates.length}  
**Near Duplicates:** ${results.nearDuplicates.length}  
**Unique Files:** ${results.unique.length}

## Exact Duplicates

`;

  if (results.exactDuplicates.length === 0) {
    report += 'No exact duplicates found.\n\n';
  } else {
    results.exactDuplicates.forEach((dup, index) => {
      report += `### Group ${index + 1}\n`;
      report += `**Canonical:** \`${dup.canonical}\`\n\n`;
      report += `**Duplicates:**\n`;
      dup.files.forEach(file => {
        const isCanonical = file === dup.canonical ? ' (CANONICAL)' : '';
        report += `- \`${file}\`${isCanonical}\n`;
      });
      report += '\n';
    });
  }

  report += `## Near Duplicates (Similarity ≥ ${SIMILARITY_THRESHOLD})

`;

  if (results.nearDuplicates.length === 0) {
    report += 'No near duplicates found.\n\n';
  } else {
    results.nearDuplicates.forEach((dup, index) => {
      report += `### ${index + 1}. ${dup.title1} ↔ ${dup.title2}\n`;
      report += `**Similarity:** ${(dup.similarity * 100).toFixed(1)}%\n`;
      report += `- \`${dup.file1}\`\n`;
      report += `- \`${dup.file2}\`\n\n`;
    });
  }

  report += `## Unique Files

`;

  if (results.unique.length === 0) {
    report += 'No unique files found.\n\n';
  } else {
    results.unique.forEach(file => {
      report += `- \`${file.path}\` - ${file.title}\n`;
    });
  }

  report += `\n## Recommendations

### For Exact Duplicates
1. **Choose canonical file** (prefer README-linked, docs/ location, shorter path)
2. **Append unique content** from duplicates to canonical
3. **Move duplicates** to \`/_meta/archive/docs/\` with stub links
4. **Update references** to point to canonical file

### For Near Duplicates
1. **Review content** for merge opportunities
2. **Create merge plan** in \`docs/_docs-merge-plan.md\`
3. **Append unique sections** to target document
4. **Archive or consolidate** as appropriate

### General Guidelines
- **Append > New:** Prefer appending to existing docs over creating new ones
- **Canonical > Duplicate:** Always choose and maintain canonical versions
- **Archive > Delete:** Move unused docs to archive rather than deleting
- **Link > Copy:** Reference canonical docs rather than duplicating content

`;

  fs.writeFileSync('docs/_docs-audit.md', report);
}

// Run the audit
if (require.main === module) {
  auditDocs();
}

module.exports = { auditDocs };
