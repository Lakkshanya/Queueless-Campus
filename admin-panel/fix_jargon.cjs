const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:\\cprogram\\Queueless-Campus\\admin-panel\\src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/Terminal Grid/gi, 'Counters');
    content = content.replace(/Terminal Idle/gi, 'Counter Idle');
    content = content.replace(/Total Terminals/gi, 'Total Counters');
    content = content.replace(/No terminals detected/gi, 'No counters detected');
    content = content.replace(/to a terminal/gi, 'to a counter');
    content = content.replace(/allocate terminal/gi, 'allocate counter');
    content = content.replace(/operate queue terminals/gi, 'operate counters');
    content = content.replace(/Terminal Offline/gi, 'Counter Offline');
    content = content.replace(/"Terminal"/g, '"Counter"');
    content = content.replace(/>Terminal</g, '>Counter<');
    content = content.replace(/'Terminal'/g, "'Counter'");

    content = content.replace(/Neural Workload/gi, 'Workload');
    content = content.replace(/Neural Link Synchronization/gi, 'Server Synchronization');
    content = content.replace(/Neural Offset Active/gi, 'System Active');
    content = content.replace(/Neural Sync/gi, 'System Status');
    content = content.replace(/Neural Re-Sync/gi, 'Re-Sync');
    content = content.replace(/Neural Registry/gi, 'Database');
    content = content.replace(/Initializing Neural Link\.\.\./gi, 'Loading Dashboard...');
    content = content.replace(/Synthesizing Neural Intelligence\.\.\./gi, 'Loading Analytics...');
    content = content.replace(/neural uplink/gi, 'system');
    content = content.replace(/central neural registry/gi, 'system database');

    content = content.replace(/Registry Initialization/gi, 'Create Counter');
    content = content.replace(/SEARCH REGISTRY/gi, 'SEARCH');
    content = content.replace(/academic registry/gi, 'academic database');
    content = content.replace(/System registry returned/gi, 'System returned');
    content = content.replace(/Finance Registry/gi, 'Finance Department');
    content = content.replace(/Back to Registry/gi, 'Back to Signup');
    content = content.replace(/-Registry/gi, '');
    content = content.replace(/>Registry</g, '>System<');

    content = content.replace(/Global Command Center/gi, 'Admin Dashboard');
    content = content.replace(/System Command Center/gi, 'Admin Dashboard');
    content = content.replace(/Signal Command/gi, 'Notifications');
    content = content.replace(/"Command"/g, '"Admin"');
    content = content.replace(/'Command'/g, "'Admin'");
    content = content.replace(/>Command</g, '>Admin<');

    content = content.replace(/Secure Portal/gi, 'Portal');
    content = content.replace(/Secure Access/gi, 'Access Control');
    content = content.replace(/Initialize Access/gi, 'Select Role');
    content = content.replace(/Initializing\.\.\./gi, 'Loading...');
    content = content.replace(/IDENTIFY TUNNEL ACCESS POINT/gi, 'Enter IP/Tunnel Link');
    
    // Role Selection Specifics
    content = content.replace(/Define your operational role within the collective/gi, 'Choose your account type');
    content = content.replace(/Execute system directives.*sectors.'/g, "Manage services, counters, staff, and system analytics.'");
    content = content.replace(/Monitor enqueued students.*flow.'/g, "Manage queues, call students, and handle service delivery.'");

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Done replacing language.');
