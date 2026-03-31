#!/usr/bin/env node
// scripts/fix-import-errors.js
const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "../lib/pages");

// Patterns to fix
const fixes = [
  {
    // Remove react-router-dom imports that are no longer needed
    find: /import\s+{\s*Outlet\s*}\s+from\s+['"]react-router-dom['"]/g,
    replace: `// Removed: Outlet not needed in Next.js - use nested routes instead`,
  },
  {
    // Remove Link imports from react-router
    find: /import\s+{\s*Link\s*}\s+from\s+['"]react-router-dom['"]/g,
    replace: `import Link from 'next/link'`,
  },
  {
    // Remove useLocation and useNavigate from react-router
    find: /import\s+{\s*useLocation\s*,\s*useNavigate\s*}\s+from\s+['"]react-router-dom['"]/g,
    replace: `// Removed react-router imports - using Next.js router instead`,
  },
  {
    // Fix wallet-store import
    find: /from\s+['"]@\/lib\/wallet-store['"]/g,
    replace: `from '@/lib/wallet'`,
  },
  {
    // Remove useHomeLayout imports (custom hook that doesn't exist)
    find: /import\s+{\s*useHomeLayout\s*}\s+from\s+['"](.*?)['"]/g,
    replace: `// Removed useHomeLayout hook`,
  },
  {
    // Remove Outlet usage (wrap in div instead)
    find: /<Outlet\s*\/>/g,
    replace: `{/* Routes will render here */}`,
  },
];

function fixFile(filePath) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) {
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  fixes.forEach(({ find, replace }) => {
    if (find.test(content)) {
      content = content.replace(find, replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else {
      fixFile(filePath);
    }
  });
}

if (fs.existsSync(pagesDir)) {
  console.log("🔄 Fixing import errors...");
  walkDir(pagesDir);
  console.log("✅ Import fixes complete!");
} else {
  console.log("⚠️  Pages directory not found at:", pagesDir);
}
