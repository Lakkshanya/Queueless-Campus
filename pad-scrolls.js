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

const mobileDir = path.join(process.cwd(), 'FrontendMobileApp/src');
let filesChanged = 0;

walkSync(mobileDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let newContent = content;

  // Add paddingBottom to ScrollViews if they don't have it, or enhance existing contentContainerStyle padding
  // This helps content not cut off at the bottom safe area
  newContent = newContent.replace(/<ScrollView(\s*[^>]*)(className="[^"]*?")((\s*[^>]*))>/g, (match, p1, className, rest) => {
    if (!match.includes('contentContainerStyle')) {
      return `<ScrollView${p1}${className} contentContainerStyle={{ paddingBottom: 120 }}${rest}>`;
    }
    return match;
  });

  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent, 'utf8');
    filesChanged++;
    console.log(`Padded ScrollView in: ${filepath}`);
  }
});

console.log(`Finished Mobile padding sweep. Modified ${filesChanged} layout files.`);
