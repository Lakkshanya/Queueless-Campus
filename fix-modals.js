import fs from 'fs';
import path from 'path';

const walkSync = (dir, callback) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    var filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory() && !filepath.includes('node_modules') && !filepath.includes('.git') && !filepath.includes('android') && !filepath.includes('ios')) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && (filepath.endsWith('.jsx') || filepath.endsWith('.tsx'))) {
      callback(filepath);
    }
  });
};

const adminDir = path.join(process.cwd(), 'admin-panel/src');
let filesChanged = 0;

walkSync(adminDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let newContent = content;

  // Fix overly-tight modal max-h bounds and padding
  newContent = newContent.replace(/max-h-\[95vh\]/g, 'max-h-[85vh]');
  newContent = newContent.replace(/max-h-\[90vh\]/g, 'max-h-[85vh]');
  
  // Also loosen up p-12 to p-6 md:p-10 globally for modals
  newContent = newContent.replace(/p-12/g, 'p-6 md:p-10');

  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent, 'utf8');
    filesChanged++;
    console.log(`Refactored layout bounds in: ${filepath}`);
  }
});

console.log(`Finished layout sweep. Modified ${filesChanged} layout files.`);
