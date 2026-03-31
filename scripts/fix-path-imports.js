#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Find all TypeScript/TSX files in lib/pages
function findFiles(dir, ext = ".tsx") {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(findFiles(fullPath, ext));
    } else if (item.name.endsWith(ext) || item.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

const libPagesDir = path.join(__dirname, "../lib/pages");
const files = findFiles(libPagesDir);

let fixedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const originalContent = content;

  // Fix pattern: import from '../../../data/...' -> '@/data/...'
  content = content.replace(
    /from\s+['"]\.\.\/\.\.\/\.\.\/data\/([^'"]+)['"]/g,
    "from '@/data/$1'",
  );

  // Fix pattern: import from '../../../..data/...' -> '@/data/...'
  content = content.replace(
    /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/data\/([^'"]+)['"]/g,
    "from '@/data/$1'",
  );

  // Fix pattern: import from '../../../lib/...' -> '@/lib/...'
  content = content.replace(
    /from\s+['"]\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g,
    "from '@/lib/$1'",
  );

  // Fix pattern: import from '../../../../lib/...' -> '@/lib/...'
  content = content.replace(
    /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g,
    "from '@/lib/$1'",
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✓ Fixed ${path.relative(__dirname, file)}`);
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files with path imports`);
