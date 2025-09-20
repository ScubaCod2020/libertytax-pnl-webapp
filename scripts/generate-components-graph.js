// Lightweight components dependency graph generator (Mermaid)
// Scans src/components for import relations and emits docs/architecture/components-graph.md

// ESM-friendly imports for type: module
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const componentsDir = path.join(repoRoot, 'src', 'components');
const docsDir = path.join(repoRoot, 'docs', 'architecture');
const outputMd = path.join(docsDir, 'components-graph.md');
const outputMmd = path.join(docsDir, 'components-graph.mmd');

function listFilesRecursive(startDir, exts) {
  const results = [];
  const stack = [startDir];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        // skip tests folders
        if (entry.name === '__tests__') continue;
        stack.push(full);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (exts.includes(ext)) {
          results.push(full);
        }
      }
    }
  }
  return results;
}

function readImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const imports = [];
  const importRegex = /^\s*import\s+[^'"\n]*?from\s+['"]([^'"]+)['"];?\s*$/;
  const sideEffectRegex = /^\s*import\s+['"]([^'"]+)['"];?\s*$/;
  for (const line of lines) {
    const m = importRegex.exec(line) || sideEffectRegex.exec(line);
    if (m) imports.push(m[1]);
  }
  return imports;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return null; // non-local
  const fromDir = path.dirname(fromFile);
  const target = path.normalize(path.join(fromDir, spec));
  // try extensions
  const candidates = [
    target,
    `${target}.tsx`,
    `${target}.ts`,
    path.join(target, 'index.tsx'),
    path.join(target, 'index.ts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function toRelComponentPath(absPath) {
  const rel = path.relative(componentsDir, absPath).replace(/\\/g, '/');
  return rel.startsWith('.') ? null : rel; // only include within components dir
}

function sanitizeNodeId(relPath) {
  // Mermaid node ids: avoid spaces/specials
  return relPath.replace(/[^a-zA-Z0-9_\-/]/g, '_');
}

function buildGraph() {
  if (!fs.existsSync(componentsDir)) {
    console.error('Components directory not found:', componentsDir);
    process.exit(1);
  }
  const files = listFilesRecursive(componentsDir, ['.tsx', '.ts']);
  const edges = new Set();
  const nodes = new Set();

  for (const f of files) {
    const relFrom = toRelComponentPath(f);
    if (!relFrom) continue;
    nodes.add(relFrom);
    const imports = readImports(f);
    for (const spec of imports) {
      const resolved = resolveImport(f, spec);
      if (!resolved) continue;
      const relTo = toRelComponentPath(resolved);
      if (!relTo) continue; // outside components
      edges.add(`${relFrom}-->${relTo}`);
      nodes.add(relTo);
    }
  }

  // Prepare Mermaid content
  let mermaid = 'flowchart TD\n';
  const groups = new Map();
  for (const n of nodes) {
    const top = n.includes('/') ? n.split('/')[0] : 'root';
    if (!groups.has(top)) groups.set(top, []);
    groups.get(top).push(n);
  }

  for (const [group, items] of groups.entries()) {
    mermaid += `  subgraph ${sanitizeNodeId(group)}[${group}]\n`;
    for (const item of items) {
      const id = sanitizeNodeId(item);
      mermaid += `    ${id}["${item}"]\n`;
    }
    mermaid += '  end\n';
  }

  for (const e of edges) {
    const [from, to] = e.split('-->');
    mermaid += `  ${sanitizeNodeId(from)} --> ${sanitizeNodeId(to)}\n`;
  }

  const header = '# Components Dependency Graph\\nPath: /docs/architecture\\n\\nPurpose: Visual map of component imports within src/components (generated).';
  const md = header.replace(/\\n/g, '\n') + '\n\n```mermaid\n' + mermaid + '```\n'

  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(outputMd, md, 'utf8');
  fs.writeFileSync(outputMmd, mermaid, 'utf8');
  console.log('Generated:', path.relative(repoRoot, outputMd));
}

buildGraph();
