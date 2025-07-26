#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🧹 MOHR HR System - Clean Script\n');

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      if (os.platform() === 'win32') {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
      }
      console.log(`✅ Removed: ${dirPath}`);
      return true;
    } catch (e) {
      console.warn(`⚠️ Could not remove: ${dirPath}`);
      return false;
    }
  }
  return false;
}

function cleanNodeModules() {
  console.log('📦 Cleaning node_modules...');
  
  const dirs = [
    'node_modules',
    'backend/node_modules',
    'frontend/node_modules',
    'electron/node_modules'
  ];
  
  dirs.forEach(dir => {
    removeDirectory(path.join(__dirname, '..', dir));
  });
}

function cleanBuildArtifacts() {
  console.log('🔨 Cleaning build artifacts...');
  
  const dirs = [
    'frontend/build',
    'electron/dist',
    'electron/out',
    'logs',
    'temp',
    'uploads'
  ];
  
  dirs.forEach(dir => {
    removeDirectory(path.join(__dirname, '..', dir));
  });
}

function cleanCache() {
  console.log('🗑️ Cleaning cache...');
  
  try {
    // Clean npm cache
    execSync('npm cache clean --force', { stdio: 'ignore' });
    console.log('✅ NPM cache cleaned');
  } catch (e) {
    console.warn('⚠️ Could not clean NPM cache');
  }
  
  // Clean Electron cache
  const electronCache = path.join(os.homedir(), '.electron');
  removeDirectory(electronCache);
  
  // Clean Electron Builder cache
  const electronBuilderCache = path.join(os.homedir(), '.cache', 'electron-builder');
  removeDirectory(electronBuilderCache);
}

function cleanDatabase() {
  console.log('🗄️ Cleaning database files...');
  
  const dbFiles = [
    'backend/mohr.db',
    'backend/test.db',
    'backend/*.db-journal'
  ];
  
  dbFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
      } catch (e) {
        console.warn(`⚠️ Could not remove: ${file}`);
      }
    }
  });
}

function cleanLogs() {
  console.log('📝 Cleaning log files...');
  
  const logFiles = [
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*'
  ];
  
  logFiles.forEach(pattern => {
    try {
      if (os.platform() === 'win32') {
        execSync(`del /q "${pattern}"`, { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
      } else {
        execSync(`rm -f ${pattern}`, { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
      }
    } catch (e) {
      // Ignore errors if no files found
    }
  });
}

function cleanEnvironmentFiles() {
  console.log('⚙️ Cleaning environment files...');
  
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local'
  ];
  
  envFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
      } catch (e) {
        console.warn(`⚠️ Could not remove: ${file}`);
      }
    }
  });
}

function main() {
  try {
    console.log('🧹 Starting clean process...\n');
    
    cleanNodeModules();
    cleanBuildArtifacts();
    cleanCache();
    cleanDatabase();
    cleanLogs();
    cleanEnvironmentFiles();
    
    console.log('\n🎉 Clean process completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm install" to reinstall dependencies');
    console.log('2. Run "npm start" to start the development server');
    console.log('3. Run "npm run electron" to build the desktop app');
    
  } catch (error) {
    console.error('\n❌ Clean process failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 