const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'FrontendMobileApp/src'),
  path.join(__dirname, 'admin-panel/src')
];

let replacedCount = 0;

function cleanFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      cleanFiles(fullPath);
    } else if (file.match(/\.(jsx?|tsx?|css)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // 1. Remove style={{ fontFamily: 'Times New Roman', ... }} blocks
      // Example: style={{ fontFamily: 'Times New Roman' }} or style={{ fontFamily: "'Times New Roman', Times, serif" }}
      content = content.replace(/style=\{\{\s*fontFamily:\s*['"](?:Times New Roman|'Times New Roman', Times, serif)['"]\s*\}\}\s*/g, '');
      content = content.replace(/style=\{\{\s*fontFamily:\s*['"](?:Times New Roman|'Times New Roman', Times, serif)['"]\s*,\s*/g, 'style={{ ');

      // 2. Remove font-serif class
      content = content.replace(/\bfont-serif\b/g, '');

      // 3. Remove style with font-display (for admin panel)
      content = content.replace(/style=\{\{\s*fontFamily:\s*['"](?:'Times New Roman', Times, serif)['"]\s*\}\}/g, '');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        replacedCount++;
        console.log(`Cleaned font styles in: ${fullPath}`);
      }
    }
  });
}

directories.forEach(cleanFiles);

console.log(`Finished sweeping fonts. Modified ${replacedCount} files.`);
