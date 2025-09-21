#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');
const openapiPath = path.join(root, 'openapi', 'openapi.yaml');

const targets = [
  {
    name: 'react',
    outDir: path.join(root, 'src', 'lib', 'api-client'),
  },
  {
    name: 'angular',
    outDir: path.join(root, 'angular', 'src', 'app', 'lib', 'api-client'),
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

async function run() {
  if (!fs.existsSync(openapiPath)) {
    console.error('OpenAPI file not found:', openapiPath);
    process.exit(0);
  }

  for (const t of targets) {
    ensureDir(t.outDir);
    const typesPath = path.join(t.outDir, 'types.d.ts');
    const clientPath = path.join(t.outDir, 'client.ts');

    // Generate types using openapi-typescript
    try {
      const { default: openapiTS } = await import('openapi-typescript');
      const yamlText = fs.readFileSync(openapiPath, 'utf8');
      const schemaObj = YAML.parse(yamlText);
      const dts = await openapiTS(schemaObj, { exportType: true });
      fs.writeFileSync(typesPath, dts, 'utf8');
    } catch (e) {
      console.warn('openapi-typescript not available; writing minimal fallback types');
      const fallback = `declare namespace API { export type Health = { status?: string }; export type Summary = { netIncome?: number; netMargin?: number; totalRevenue?: number }; }`;
      fs.writeFileSync(typesPath, fallback, 'utf8');
    }

    // Write a small fetch client wrapper
    const client = `
/* Auto-generated lightweight API client. Edit as needed. */
import './types.d';

export async function getHealth(baseUrl = ''): Promise<API.Health> {
  const res = await fetch(new URL('/api/health', baseUrl || window.location.origin));
  if (!res.ok) throw new Error('Health failed: ' + res.status);
  return res.json();
}

export async function getSummary(params: { region?: 'US' | 'CA'; year?: number }, baseUrl = ''): Promise<API.Summary> {
  const url = new URL('/api/reports/summary', baseUrl || window.location.origin);
  for (const [k, v] of Object.entries(params || {})) if (v != null) url.searchParams.set(k, String(v));
  const res = await fetch(url);
  if (!res.ok) throw new Error('Summary failed: ' + res.status);
  return res.json();
}
`;
    writeIfMissing(clientPath, client);
  }

  console.log('API clients generated/updated');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
