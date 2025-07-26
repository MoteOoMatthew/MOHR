#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔨 MOHR HR System - Robust Electron Build Script\n');

// Configuration
const config = {
  skipCodeSigning: true, // Skip code signing to avoid network/permission issues
  buildOptions: {
    win: {
      target: 'portable', // Use portable instead of installer to avoid code signing
      icon: path.join(__dirname, '../electron/assets/icon.ico')
    }
  }
};

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch (e) {
    console.error('❌ Node.js not found');
    process.exit(1);
  }
  
  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
  } catch (e) {
    console.error('❌ npm not found');
    process.exit(1);
  }
}

function fixPowerShellExecutionPolicy() {
  if (os.platform() === 'win32') {
    console.log('🔧 Fixing PowerShell execution policy...');
    try {
      execSync('powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"', {
        stdio: 'ignore'
      });
      console.log('✅ PowerShell execution policy fixed');
    } catch (e) {
      console.warn('⚠️ Could not fix PowerShell execution policy automatically');
    }
  }
}

function killExistingProcesses() {
  console.log('🔄 Stopping existing processes...');
  try {
    if (os.platform() === 'win32') {
      execSync('taskkill /F /IM node.exe 2>nul || exit 0', { stdio: 'ignore' });
    } else {
      execSync('pkill -f "node.*server.js" 2>/dev/null || exit 0', { stdio: 'ignore' });
    }
    console.log('✅ Existing processes stopped');
  } catch (e) {
    // Ignore errors if no processes were running
  }
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  const dirs = ['backend', 'frontend', 'electron'];
  
  dirs.forEach(dir => {
    const pkgPath = path.join(__dirname, '..', dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      console.log(`\n📦 Installing dependencies in ${dir}...`);
      try {
        execSync('npm install', {
          cwd: path.join(__dirname, '..', dir),
          stdio: 'inherit'
        });
        console.log(`✅ ${dir} dependencies installed`);
      } catch (e) {
        console.error(`❌ Failed to install dependencies in ${dir}`);
        process.exit(1);
      }
    }
  });
}

function buildFrontend() {
  console.log('\n🔨 Building frontend...');
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  try {
    execSync('npm run build', {
      cwd: frontendPath,
      stdio: 'inherit'
    });
    console.log('✅ Frontend built successfully');
  } catch (e) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }
}

function buildElectron() {
  console.log('\n🔨 Building Electron application...');
  const electronPath = path.join(__dirname, '..', 'electron');
  
  // Create electron-builder config
  const builderConfig = {
    appId: 'com.mohr.hrsystem',
    productName: 'MOHR HR System',
    directories: {
      output: 'dist'
    },
    files: [
      '**/*',
      '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
      '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
      '!**/node_modules/*.d.ts',
      '!**/node_modules/.bin',
      '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
      '!.editorconfig',
      '!**/._*',
      '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
      '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
      '!**/{appveyor.yml,.travis.yml,circle.yml}',
      '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
    ],
    win: {
      target: 'portable',
      icon: path.join(__dirname, '../electron/assets/icon.ico')
    },
    mac: {
      target: 'dmg',
      icon: path.join(__dirname, '../electron/assets/icon.icns')
    },
    linux: {
      target: 'AppImage',
      icon: path.join(__dirname, '../electron/assets/icon.png')
    }
  };
  
  // Write electron-builder config
  const configPath = path.join(electronPath, 'electron-builder.json');
  fs.writeFileSync(configPath, JSON.stringify(builderConfig, null, 2));
  
  try {
    // Build without code signing
    execSync('npx electron-builder --config electron-builder.json --win portable --publish=never', {
      cwd: electronPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        CSC_IDENTITY_AUTO_DISCOVERY: 'false' // Disable code signing
      }
    });
    console.log('✅ Electron application built successfully');
  } catch (e) {
    console.error('❌ Electron build failed');
    console.log('\n💡 Trying alternative build method...');
    
    try {
      // Fallback: use npm script
      execSync('npm run dist-win', {
        cwd: electronPath,
        stdio: 'inherit',
        env: {
          ...process.env,
          CSC_IDENTITY_AUTO_DISCOVERY: 'false'
        }
      });
      console.log('✅ Electron application built successfully (fallback method)');
    } catch (e2) {
      console.error('❌ All build methods failed');
      process.exit(1);
    }
  }
}

function verifyBuild() {
  console.log('\n🔍 Verifying build...');
  
  const distPath = path.join(__dirname, '..', 'electron', 'dist');
  const winUnpackedPath = path.join(distPath, 'win-unpacked');
  const exePath = path.join(winUnpackedPath, 'MOHR HR System.exe');
  
  if (fs.existsSync(exePath)) {
    const stats = fs.statSync(exePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`✅ Desktop application built successfully`);
    console.log(`📁 Location: ${exePath}`);
    console.log(`📊 Size: ${sizeMB} MB`);
    return true;
  } else {
    console.error('❌ Desktop application not found');
    return false;
  }
}

function createLaunchScript() {
  console.log('\n📝 Creating launch script...');
  
  const launchScript = `@echo off
title MOHR HR System - Desktop
echo.
echo ========================================
echo    MOHR HR System - Desktop Launch
echo ========================================
echo.

cd /d "%~dp0"
if exist "MOHR HR System.exe" (
    echo 🚀 Launching MOHR HR System...
    start "" "MOHR HR System.exe"
) else (
    echo ❌ MOHR HR System.exe not found
    echo Please run the build script first
    pause
)
`;
  
  const scriptPath = path.join(__dirname, '..', 'electron', 'dist', 'win-unpacked', 'launch-mohr.bat');
  fs.writeFileSync(scriptPath, launchScript);
  console.log('✅ Launch script created');
}

function main() {
  try {
    checkPrerequisites();
    fixPowerShellExecutionPolicy();
    killExistingProcesses();
    installDependencies();
    buildFrontend();
    buildElectron();
    
    if (verifyBuild()) {
      createLaunchScript();
      
      console.log('\n🎉 Desktop application build completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Navigate to: electron/dist/win-unpacked/');
      console.log('2. Double-click "MOHR HR System.exe" to launch');
      console.log('3. Or run "launch-mohr.bat" for easy launching');
      console.log('\n💡 The desktop app will start its own backend server automatically');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 