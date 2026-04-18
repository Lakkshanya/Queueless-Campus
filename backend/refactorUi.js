const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, '../admin-panel/src'),
    path.join(__dirname, '../FrontendMobileApp/src')
];

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace font-black with font-bold
    content = content.replace(/font-black/g, 'font-bold');
    
    // Remove all tracking-xxx classes (tracking-widest, tracking-tighter, tracking-[...])
    content = content.replace(/tracking-\[[^\]]+\]/g, '');
    content = content.replace(/tracking-widest/g, '');
    content = content.replace(/tracking-wider/g, '');
    content = content.replace(/tracking-wide/g, '');
    content = content.replace(/tracking-tight/g, '');
    content = content.replace(/tracking-tighter/g, '');
    
    // Replace micro text sizes with standard text-xs or text-sm
    content = content.replace(/text-\[8px\]/g, 'text-xs');
    content = content.replace(/text-\[9px\]/g, 'text-xs');
    content = content.replace(/text-\[10px\]/g, 'text-xs');
    content = content.replace(/text-\[11px\]/g, 'text-xs');
    content = content.replace(/text-\[12px\]/g, 'text-sm');
    content = content.replace(/text-\[13px\]/g, 'text-sm');
    
    // Clean up multiple spaces left by removal
    content = content.replace(/className=(['"{`])\s+/g, 'className=$1');
    content = content.replace(/\s+(['"`}])/g, '$1');
    content = content.replace(/\s{2,}/g, ' ');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Refactored:', filePath);
    }
}

targetDirs.forEach(dir => processDirectory(dir));
console.log('Global UI Refactoring Complete.');
