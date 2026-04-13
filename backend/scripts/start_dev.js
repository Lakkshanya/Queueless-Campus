import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Helper to get local network IP (WiFi)
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const LOCAL_IP = getLocalIp();
const LOCAL_PORT = 8989;

// CLEANUP LOGS
const logFile = path.join(process.cwd(), 'tunnel.log');
fs.writeFileSync(logFile, `Starting Backend at ${new Date().toISOString()}\n`);

console.log(`\n===============================================`);
console.log(` 🚀 QUEUELESS BACKEND v13 (POWER MODE)`);
console.log(` WiFi: http://${LOCAL_IP}:${LOCAL_PORT}/api`);
console.log(` Logs: ${logFile}`);
console.log(`===============================================`);

// 1. Start Server
const server = spawn('node', ['--watch', 'src/server.js'], { 
  stdio: 'inherit',
  shell: true 
});

// 2. Start Cloudflare Tunnel (Stable)
console.log(`📡 Opening Cloudflare Secure Tunnel...`);

const tunnel = spawn('npx', ['cloudflared', 'tunnel', '--url', `http://localhost:${LOCAL_PORT}`], {
  shell: true
});

tunnel.stderr.on('data', (data) => {
  const output = data.toString();
  fs.appendFileSync(logFile, output);

  // Look for the tunnel URL
  if (output.includes('https://') && output.includes('.trycloudflare.com')) {
    const lines = output.split('\n');
    const urlLine = lines.find(l => l.includes('https://') && l.includes('.trycloudflare.com'));
    if (urlLine) {
        const matches = urlLine.match(/https:\/\/([a-z0-9-]+)\.trycloudflare\.com/);
        if (matches && matches[0]) {
            const tunnelUrl = matches[0];
            const tunnelName = matches[1];
            
            console.log(`\n✅ TUNNEL ESTABLISHED!`);
            console.log(`🔗 URL: ${tunnelUrl}`);
            console.log(`🔑 NAME: ${tunnelName}`);
            console.log(`===============================================`);
            console.log(` ACTION: Copy the name [ ${tunnelName} ]`);
            console.log(` PASTE IT into the "Sync" button on your website/app.`);
            console.log(`===============================================\n`);
        }
    }
  }
});

tunnel.on('exit', (code) => {
    console.log(`❌ Tunnel died with code ${code}. Restarting...`);
    // Auto-restart logic could go here if needed
});

process.on('SIGINT', () => {
    server.kill();
    tunnel.kill();
    process.exit();
});
