#!/usr/bin/env node
/*
Dev-only pre-commit guard:
 - If milestone sources changed, require docs/DEVELOPMENT_PROGRESS_LOG.md to be staged
 - Exits non-zero with a short message to remind exporting or updating the log
*/

import { execSync } from 'node:child_process';

function getStagedFiles() {
  const out = execSync('git diff --cached --name-only', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
  return out ? out.split('\n') : [];
}

function hasMilestoneChanges(files) {
  const patterns = [
    'angular/src/app/lib/milestones.ts',
    'angular/src/app/services/milestones.service.ts',
    'angular/src/app/components/debug-panel/',
  ];
  return files.some((f) => patterns.some((p) => f === p || f.startsWith(p)));
}

function isDocsLogStaged(files) {
  return files.includes('docs/DEVELOPMENT_PROGRESS_LOG.md');
}

function main() {
  const files = getStagedFiles();
  if (files.length === 0) process.exit(0);
  if (!hasMilestoneChanges(files)) process.exit(0);
  if (isDocsLogStaged(files)) process.exit(0);

  const msg = [
    '\n⛔ Commit blocked: Milestone/debug changes detected but docs/DEVELOPMENT_PROGRESS_LOG.md is not staged.',
    '➡ Tip: In the Debug panel click "Copy MD to clipboard" or "Download MD" and add it to docs/.',
    '   Then: git add docs/DEVELOPMENT_PROGRESS_LOG.md',
  ].join('\n');
  console.error(msg);
  process.exit(1);
}

main();
