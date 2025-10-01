#!/usr/bin/env node
/*
  Post-build step to flatten Angular's dist/browser into dist so Vercel's Angular preset
  finds index.html at the dist root without custom settings.
*/
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const browserDir = path.join(distDir, 'browser');

function moveRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      moveRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (fs.existsSync(browserDir)) {
    moveRecursive(browserDir, distDir);
    // Remove the now-empty browser folder
    fs.rmSync(browserDir, { recursive: true, force: true });
    console.log('Flattened dist/browser into dist.');
  } else {
    console.log('No dist/browser directory to flatten.');
  }
} catch (err) {
  console.error('Postbuild flatten failed:', err.message);
  process.exit(1);
}


