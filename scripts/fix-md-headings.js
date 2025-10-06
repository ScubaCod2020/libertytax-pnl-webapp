#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Normalize blank lines around Markdown headings (MD022):
 * - Ensure exactly one blank line before and after ATX headings (#..######),
 *   except at start or end of file where only below/above is applied.
 * - Does not alter content inside fenced code blocks.
 */

const repoRoot = process.cwd();

function isMarkdown(file) {
  return file.toLowerCase().endsWith('.md');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && isMarkdown(entry.name)) files.push(full);
  }
  return files;
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split(/\r?\n/);

  const fenceRegex = /^\s*```/; // fence start/end
  const headingRegex = /^\s{0,3}#{1,6}(\s|$)/; // ATX headings only

  let inFence = false;
  const output = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (fenceRegex.test(line)) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (!inFence && headingRegex.test(line)) {
      // Ensure one blank line before (unless at start)
      if (output.length > 0) {
        // Remove trailing blank lines
        while (output.length > 0 && output[output.length - 1].trim() === '') {
          output.pop();
        }
        // Add exactly one blank line before
        output.push('');
      }
      output.push(line);

      // Look ahead to consume following blank lines and reinsert exactly one
      let j = i + 1;
      // Capture any existing blank lines right after heading
      while (j < lines.length && lines[j].trim() === '') j++;
      // Insert exactly one blank line after heading if not end of file
      if (j < lines.length) output.push('');
      i = j - 1; // advance
      continue;
    }

    output.push(line);
  }

  // Normalize final newline
  const fixed = output.join('\n');
  if (fixed !== original) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    return true;
  }
  return false;
}

const files = walk(repoRoot);
let changed = 0;
for (const file of files) {
  try {
    if (fixFile(file)) changed++;
  } catch (err) {
    console.error(`Failed to process ${file}:`, err.message);
  }
}

console.log(`MD022 fix complete. Files updated: ${changed}`);
