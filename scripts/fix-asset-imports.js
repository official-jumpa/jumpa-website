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
    } else if (item.name.endsWith(ext)) {
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

  // Fix pattern: replace relative asset imports with public folder references
  // Match: import ... from '../../../assets/icons/...'
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/\.\.\/assets\/icons\/([^'"]+)['"]/g,
    "const $1 = '/assets/icons/$2';",
  );

  // Also handle patterns from deeper paths
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/assets\/icons\/([^'"]+)['"]/g,
    "const $1 = '/assets/icons/$2';",
  );

  // Replace any remaining import statements for assets to const declarations
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]*assets[^'"]*)['"]/g,
    (match, varName, assetPath) => {
      // Extract the asset path from the import
      const filename = path.basename(assetPath);
      return `const ${varName} = '/assets/${filename}';`;
    },
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✓ Fixed ${file}`);
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files with asset imports`);
