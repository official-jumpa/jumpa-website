#!/usr/bin/env node
// scripts/migrate-pages.js
// Automatically convert React Router pages to Next.js pages

const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "../lib/pages");

// Patterns to replace
const replacements = [
  {
    // Replace React Router import
    find: /import\s+{\s*useNavigate\s*}\s+from\s+['"]react-router-dom['"]/g,
    replace: `import { useRouter } from 'next/navigation'`,
  },
  {
    // Replace useNavigate hook declaration
    find: /const\s+navigate\s+=\s+useNavigate\(\);/g,
    replace: `const router = useRouter();`,
  },
  {
    // Replace navigate(-1) with router.back()
    find: /navigate\s*\(\s*-1\s*\)/g,
    replace: `router.back()`,
  },
  {
    // Replace navigate() with router.push()
    find: /navigate\s*\(\s*(['"`][^'"`]*['"`])\s*\)/g,
    replace: `router.push($1)`,
  },
  {
    // Replace useLocation
    find: /import\s+{\s*useLocation\s*}\s+from\s+['"]react-router-dom['"]/g,
    replace: `// useLocation not needed in Next.js`,
  },
  {
    // Replace useParams
    find: /import\s+{\s*useParams\s*}\s+from\s+['"]react-router-dom['"]/g,
    replace: `// useParams replaced by Next.js searchParams`,
  },
];

function migrateFile(filePath) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) {
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  replacements.forEach(({ find, replace }) => {
    if (find.test(content)) {
      content = content.replace(find, replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✓ Migrated: ${path.relative(process.cwd(), filePath)}`);
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
      migrateFile(filePath);
    }
  });
}

if (fs.existsSync(pagesDir)) {
  console.log("🔄 Starting page migration...");
  walkDir(pagesDir);
  console.log("✅ Migration complete!");
} else {
  console.log("⚠️  Pages directory not found at:", pagesDir);
}
