// tools/reorder-sass-directives.js
// Reorders top-level @use/@forward to top of .scss files in allowed paths.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = process.cwd();
const allowGlobs = ['angular/src', 'apps'];

function isAllowed(p) {
  const rel = path.relative(ROOT, p).replace(/\\/g, '/');
  return allowGlobs.some((base) => rel.startsWith(base + '/'));
}

function listScss(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.git'].includes(ent.name)) continue;
      listScss(p, out);
    } else if (ent.isFile() && p.endsWith('.scss') && isAllowed(p)) {
      out.push(p);
    }
  }
  return out;
}

function processFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');

  // Identify leading banner (comments/blank lines from top)
  let i = 0;
  let inBlock = false;
  while (i < lines.length) {
    const l = lines[i];
    const trim = l.trim();
    if (inBlock) {
      if (trim.endsWith('*/')) inBlock = false;
      i++;
      continue;
    }
    if (trim.startsWith('/*')) {
      inBlock = !trim.endsWith('*/');
      i++;
      continue;
    }
    if (trim.startsWith('//') || trim === '') {
      i++;
      continue;
    }
    break; // first non-comment, non-blank line
  }
  const bannerEnd = i;

  // Collect top-level @use/@forward lines and their indices
  const dirRx = /^\s*@(?:use|forward)\b.*;[ \t]*$/;
  const directives = [];
  for (let idx = 0; idx < lines.length; idx++) {
    if (dirRx.test(lines[idx])) directives.push(idx);
  }
  if (directives.length === 0) return false;

  // If first directive already within banner area, still ensure all are contiguous at top.
  // Extract directive lines preserving order.
  const dirLines = directives.map((idx) => lines[idx]);

  // Remove directive lines from original spots
  const toRemove = new Set(directives);
  const remaining = lines.filter((_, idx) => !toRemove.has(idx));

  // Recompute: insert after banner
  const before = remaining.slice(0, bannerEnd);
  const after = remaining.slice(bannerEnd);
  const needsSpacer = after[0] && after[0].trim() !== '' ? [''] : [];
  const newLines = [...before, ...dirLines, ...needsSpacer, ...after];

  const out = newLines.join('\n');
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const startDir = ROOT;
  const files = listScss(startDir);
  console.log('Found SCSS files:', files.length);

  let changed = 0;
  for (const f of files) {
    if (processFile(f)) {
      console.log('fixed:', path.relative(ROOT, f));
      changed++;
    }
  }
  console.log(`Done. Files changed: ${changed}`);
}

// Run if this is the main module
if (
  import.meta.url.startsWith('file:') &&
  process.argv[1] &&
  import.meta.url.endsWith(path.basename(process.argv[1]))
) {
  main();
}
