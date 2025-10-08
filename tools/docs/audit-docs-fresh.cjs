const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const DOCS_DIR = 'docs';
const OUTPUT_DIR = 'docs';
const SIMILARITY_THRESHOLD = 0.7; // Jaccard similarity threshold

// Helper function to normalize markdown content
function normalizeContent(content) {
  return content
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// Helper function to create n-gram shingles
function createShingles(text, n = 5) {
  const words = text.split(' ');
  const shingles = new Set();
  
  for (let i = 0; i <= words.length - n; i++) {
    const shingle = words.slice(i, i + n).join(' ');
    shingles.add(shingle);
  }
  
  return shingles;
}

// Helper function to calculate Jaccard similarity
function jaccardSimilarity(set1, set2) {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

// Main audit function
function auditDocs() {
  console.log('🔍 Starting fresh documentation audit...\n');
  
  const files = [];
  const contentHashes = new Map();
  const contentMap = new Map();
  const exactDuplicates = [];
  const nearDuplicates = [];
  const uniqueFiles = [];
  
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
          const normalized = normalizeContent(content);
          const hash = crypto.createHash('sha256').update(normalized).digest('hex');
          
          files.push({
            path: fullPath,
            name: item,
            size: stat.size,
            modified: stat.mtime,
            content: content,
            normalized: normalized,
            hash: hash
          });
          
          if (contentHashes.has(hash)) {
            exactDuplicates.push({
              file: fullPath,
              duplicateOf: contentHashes.get(hash)
            });
          } else {
            contentHashes.set(hash, fullPath);
            contentMap.set(fullPath, normalized);
          }
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  scanDirectory(DOCS_DIR);
  
  // Find near duplicates
  const filePaths = Array.from(contentMap.keys());
  for (let i = 0; i < filePaths.length; i++) {
    for (let j = i + 1; j < filePaths.length; j++) {
      const file1 = filePaths[i];
      const file2 = filePaths[j];
      const content1 = contentMap.get(file1);
      const content2 = contentMap.get(file2);
      
      const shingles1 = createShingles(content1);
      const shingles2 = createShingles(content2);
      const similarity = jaccardSimilarity(shingles1, shingles2);
      
      if (similarity >= SIMILARITY_THRESHOLD) {
        nearDuplicates.push({
          file1: file1,
          file2: file2,
          similarity: similarity
        });
      }
    }
  }
  
  // Identify unique files
  const duplicateFiles = new Set();
  exactDuplicates.forEach(dup => duplicateFiles.add(dup.file));
  nearDuplicates.forEach(dup => {
    duplicateFiles.add(dup.file1);
    duplicateFiles.add(dup.file2);
  });
  
  files.forEach(file => {
    if (!duplicateFiles.has(file.path)) {
      uniqueFiles.push(file);
    }
  });
  
  // Generate audit results
  const auditResults = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      exactDuplicates: exactDuplicates.length,
      nearDuplicates: nearDuplicates.length,
      uniqueFiles: uniqueFiles.length
    },
    exactDuplicates: exactDuplicates,
    nearDuplicates: nearDuplicates.map(dup => ({
      file1: dup.file1,
      file2: dup.file2,
      similarity: Math.round(dup.similarity * 100) + '%'
    })),
    uniqueFiles: uniqueFiles.map(file => ({
      path: file.path,
      name: file.name,
      size: file.size,
      modified: file.modified.toISOString()
    })),
    allFiles: files.map(file => ({
      path: file.path,
      name: file.name,
      size: file.size,
      modified: file.modified.toISOString(),
      hash: file.hash.substring(0, 8) + '...'
    }))
  };
  
  // Write JSON results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_docs-audit-fresh.json'),
    JSON.stringify(auditResults, null, 2)
  );
  
  // Generate human-readable report
  let report = `# Fresh Documentation Audit Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  
  report += `## 📊 Summary\n\n`;
  report += `- **Total Files:** ${files.length}\n`;
  report += `- **Exact Duplicates:** ${exactDuplicates.length}\n`;
  report += `- **Near Duplicates:** ${nearDuplicates.length}\n`;
  report += `- **Unique Files:** ${uniqueFiles.length}\n\n`;
  
  if (exactDuplicates.length > 0) {
    report += `## 🔄 Exact Duplicates\n\n`;
    exactDuplicates.forEach(dup => {
      report += `- **${dup.file}** → duplicates **${dup.duplicateOf}**\n`;
    });
    report += `\n`;
  }
  
  if (nearDuplicates.length > 0) {
    report += `## 🔍 Near Duplicates (Similarity ≥ ${SIMILARITY_THRESHOLD * 100}%)\n\n`;
    nearDuplicates.forEach(dup => {
      report += `- **${dup.file1}** ↔ **${dup.file2}** (${Math.round(dup.similarity * 100)}% similar)\n`;
    });
    report += `\n`;
  }
  
  report += `## 📁 All Files\n\n`;
  report += `| File | Size | Modified | Hash |\n`;
  report += `|------|------|----------|------|\n`;
  
  files.sort((a, b) => a.path.localeCompare(b.path)).forEach(file => {
    const sizeKB = Math.round(file.size / 1024);
    const modified = file.modified.toLocaleDateString();
    report += `| \`${file.path}\` | ${sizeKB}KB | ${modified} | \`${file.hash.substring(0, 8)}...\` |\n`;
  });
  
  // Write report
  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_docs-audit-fresh.md'),
    report
  );
  
  console.log('✅ Audit complete!');
  console.log(`📊 Found ${files.length} total files`);
  console.log(`🔄 ${exactDuplicates.length} exact duplicates`);
  console.log(`🔍 ${nearDuplicates.length} near duplicates`);
  console.log(`📁 ${uniqueFiles.length} unique files`);
  console.log(`\n📄 Reports written to:`);
  console.log(`   - docs/_docs-audit-fresh.json`);
  console.log(`   - docs/_docs-audit-fresh.md`);
  
  return auditResults;
}

// Run the audit
auditDocs();
