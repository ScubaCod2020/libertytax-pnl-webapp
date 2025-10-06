// Non-blocking validator: ensures key docs referenced by INDEX/MASTER_INDEX exist
// Prints warnings but exits 0 so CI can continue

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [
  'README.md',
  'MASTER_INDEX.md',
  'docs/INDEX.md',
  'docs/LESSONS_LEARNED.md',
  'docs/COMPONENTS_TREE.md',
  'docs/MAPPING.md',
  'repo-blueprint.yml',
];

let warnings = 0;
for (const rel of checks) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    warnings++;
    console.warn(`[docs-index-validate] Missing: ${rel}`);
  }
}

if (warnings === 0) {
  console.log('[docs-index-validate] OK: All referenced docs present');
} else {
  console.log(`[docs-index-validate] WARN: ${warnings} missing items`);
}
process.exit(0);
