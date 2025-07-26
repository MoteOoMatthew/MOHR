const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Desktop Application...\n');

// Path to the desktop application
const appPath = path.join(__dirname, 'electron', 'dist', 'win-unpacked', 'MOHR HR System.exe');

console.log(`📍 Application Path: ${appPath}`);

// Check if the application exists
const fs = require('fs');
if (!fs.existsSync(appPath)) {
  console.log('❌ Application not found! Please build the desktop app first.');
  console.log('   Run: npm run build-electron');
  process.exit(1);
}

console.log('✅ Application found!');

// Check if config directory is included
const configPath = path.join(__dirname, 'electron', 'dist', 'win-unpacked', 'config');
if (!fs.existsSync(configPath)) {
  console.log('❌ Config directory missing! This will cause the app to fail.');
  console.log('   The config/environment.js file is required.');
  process.exit(1);
}

console.log('✅ Config directory found!');

// Check if backend dependencies are included
const backendPath = path.join(__dirname, 'electron', 'dist', 'win-unpacked', 'resources', 'backend');
const nodeModulesPath = path.join(backendPath, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ Backend node_modules missing! This will cause the app to fail.');
  console.log('   The backend dependencies are required.');
  process.exit(1);
}

console.log('✅ Backend dependencies found!');

console.log('\n🎉 Desktop application is properly built and ready to run!');
console.log('\n📋 To run the application:');
console.log('   1. Open File Explorer');
console.log('   2. Navigate to: D:\\Dropbox\\MOHR\\MOHR\\electron\\dist\\win-unpacked\\');
console.log('   3. Double-click: "MOHR HR System.exe"');
console.log('\n🔑 Login credentials:');
console.log('   Username: admin');
console.log('   Password: admin123'); 