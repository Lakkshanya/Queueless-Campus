const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('C:\\cprogram\\Queueless-Campus\\admin-panel\\src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Reduce text sizes
    content = content.replace(/text-6xl/g, 'text-4xl');
    content = content.replace(/text-5xl/g, 'text-3xl');
    content = content.replace(/text-4xl/g, 'text-2xl');
    content = content.replace(/text-3xl/g, 'text-xl');
    content = content.replace(/text-2xl/g, 'text-lg');
    
    // Reduce massive padding/margin
    content = content.replace(/p-16/g, 'p-8');
    content = content.replace(/p-12/g, 'p-6');
    content = content.replace(/p-10/g, 'p-6');
    content = content.replace(/p-8/g, 'p-5');
    
    content = content.replace(/px-16/g, 'px-8');
    content = content.replace(/px-12/g, 'px-6');
    content = content.replace(/px-10/g, 'px-6');
    content = content.replace(/px-8/g, 'px-5');

    content = content.replace(/py-16/g, 'py-8');
    content = content.replace(/py-12/g, 'py-6');
    content = content.replace(/py-10/g, 'py-6');
    content = content.replace(/py-8/g, 'py-5');

    content = content.replace(/mb-16/g, 'mb-8');
    content = content.replace(/mt-16/g, 'mt-8');
    content = content.replace(/my-16/g, 'my-8');
    content = content.replace(/mb-12/g, 'mb-6');
    content = content.replace(/mt-12/g, 'mt-6');
    content = content.replace(/gap-8/g, 'gap-5');
    
    // Reduce extreme borders / radii
    content = content.replace(/rounded-\[4rem\]/g, 'rounded-3xl');
    content = content.replace(/rounded-\[3\.5rem\]/g, 'rounded-2xl');
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-2xl');
    content = content.replace(/rounded-\[2rem\]/g, 'rounded-xl');
    content = content.replace(/rounded-\[1\.8rem\]/g, 'rounded-xl');
    
    // Shrink massive widths / heights
    content = content.replace(/w-96/g, 'w-64');
    content = content.replace(/h-96/g, 'h-64');
    content = content.replace(/w-80/g, 'w-64');
    content = content.replace(/w-24/g, 'w-16');
    content = content.replace(/h-24/g, 'h-16');
    content = content.replace(/w-32/g, 'w-20');
    content = content.replace(/h-32/g, 'h-20');

    // Reduce specific icon sizes
    content = content.replace(/size=\{40\}/g, 'size={28}');
    content = content.replace(/size=\{48\}/g, 'size={32}');

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('UI Sizes Reduced.');
