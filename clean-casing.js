const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'FrontendMobileApp/src'),
  path.join(__dirname, 'admin-panel/src')
];

// Map of Uppercase/All-Caps strings to properly cased ones
const replacements = [
  { from: /FILTER PERSONNEL\.\.\./g, to: 'Filter Personnel...' },
  { from: /RECRUIT STAFF/g, to: 'Recruit Staff' },
  { from: /SEARCH_GRID\.\.\./g, to: 'Search Personnel Grid...' },
  { from: /ALL_DEPARTMENTS/g, to: 'All Departments' },
  { from: /BACK_STEP/g, to: 'Go Back' },
  { from: /FINALIZE & DEPLOY/g, to: 'Finalize and Deploy' },
  { from: /MAPPED_PERSONNEL/g, to: 'Personnel' },
  { from: /ASSIGNED_SERVICE/g, to: 'Service' },
  { from: /SUCCESS:/g, to: 'Success:' },
  { from: /AUTHORIZATION FAILED:/g, to: 'Authorization Failed:' },
  { from: /AUTHORIZATION FAILED/g, to: 'Authorization Failed' },
  { from: /\bAUTHORIZED\b/g, to: 'Authorized' },
  { from: /\bLOCKED\b/g, to: 'Locked' },
  { from: /\bOPTIMAL\b/g, to: 'Optimal' },
  { from: /LIVE SWEEP/g, to: 'Live Sweep' },
  { from: /FULL ANALYTICS/g, to: 'Full Analytics' },
  { from: /SYSTEM STATUS/g, to: 'System Status' },
  { from: /TOTAL TOKENS/g, to: 'Total Tokens' },
  { from: /ACTIVE COUNTERS/g, to: 'Active Counters' },
  { from: /PENDING QUEUE/g, to: 'Pending Queue' },
  { from: /AVG WAIT TIME/g, to: 'Avg Wait Time' },
  { from: /SYNCING ADMIN RECORDS\.\.\./g, to: 'Syncing Admin Records...' },
  { from: /ADMINISTRATIVE CONTROL/g, to: 'Administrative Control' },
  { from: /OVERVIEW/g, to: 'Overview' },
  { from: /ALLOCATE_SERVICE/g, to: 'Allocate Service' },
  { from: /AUTHORIZED_STAFF/g, to: 'Authorized Staff' },
  { from: /BOOK TOKEN/g, to: 'Book Token' },
  { from: /LIVE QUEUE/g, to: 'Live Queue' },
  { from: /AGENT/g, to: 'Agent' },
  { from: /OPERATOR_CONSOLE/g, to: 'Operator Console' },
  { from: /SYNCING\.\.\./g, to: 'Syncing...' },
  { from: /NOW SERVING/g, to: 'Now Serving' },
  { from: /YOU ARE NEXT/g, to: 'You Are Next' },
  { from: /PREPARE YOURSELF/g, to: 'Prepare Yourself' },
  { from: /TERMINAL_STANDBY/g, to: 'Terminal Standby' },
  { from: /ACTIVE_ALLOCATION/g, to: 'Active Allocation' },
  { from: /PROCESSED_UNITS/g, to: 'Processed Units' },
  { from: /WAITING_IN_GRID/g, to: 'Waiting in Grid' },
  { from: /COMMUNICATIONS_IDLE/g, to: 'Communications Idle' },
  { from: /SYSTEM ERROR/g, to: 'System Error' },
  { from: /PROTOCOL_TERMINATION/g, to: 'Protocol Termination' }
];

let replacedCount = 0;

function cleanCasing(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      cleanCasing(fullPath);
    } else if (file.match(/\.(jsx?|tsx?)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      replacements.forEach(rep => {
        content = content.replace(rep.from, rep.to);
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        replacedCount++;
        console.log(`Updated casing in: ${fullPath}`);
      }
    }
  });
}

directories.forEach(cleanCasing);

console.log(`Finished updating text casing. Modified ${replacedCount} files.`);
