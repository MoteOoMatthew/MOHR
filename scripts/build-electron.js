#!/usr/bin/env node

/**
 * MOHR HR System - Electron Build Script
 * 
 * This script automates the Electron packaging process for all platforms
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${colors.bright}${colors.blue}${step}${colors.reset} - ${description}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Build configuration
const buildConfig = {
  platforms: {
    win: {
      name: 'Windows',
      targets: ['nsis', 'portable'],
      arch: ['x64']
    },
    mac: {
      name: 'macOS',
      targets: ['dmg', 'zip'],
      arch: ['x64', 'arm64']
    },
    linux: {
      name: 'Linux',
      targets: ['AppImage', 'deb', 'rpm'],
      arch: ['x64']
    }
  },
  currentPlatform: os.platform(),
  currentArch: os.arch()
};

// Helper function to run commands
function runCommand(command, cwd = process.cwd(), silent = false) {
  try {
    const options = {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      timeout: 300000 // 5 minutes
    };
    
    const result = execSync(command, options);
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Check prerequisites
function checkPrerequisites() {
  logStep('1', 'Checking Prerequisites');
  
  // Check if we're in the right directory
  if (!fs.existsSync('electron/package.json')) {
    logError('Not in the correct directory. Please run from project root.');
    return false;
  }
  
  // Check if frontend is built
  if (!fs.existsSync('frontend/build/index.html')) {
    logWarning('Frontend not built. Building frontend first...');
    const buildResult = runCommand('npm run build', 'frontend');
    if (!buildResult.success) {
      logError('Failed to build frontend');
      return false;
    }
    logSuccess('Frontend built successfully');
  } else {
    logSuccess('Frontend already built');
  }
  
  // Check Node.js version
  const nodeResult = runCommand('node --version', '.', true);
  if (nodeResult.success) {
    const version = nodeResult.output.toString().trim();
    logSuccess(`Node.js version: ${version}`);
  } else {
    logError('Node.js not found');
    return false;
  }
  
  // Check npm
  const npmResult = runCommand('npm --version', '.', true);
  if (npmResult.success) {
    const version = npmResult.output.toString().trim();
    logSuccess(`npm version: ${version}`);
  } else {
    logError('npm not found');
    return false;
  }
  
  return true;
}

// Install Electron dependencies
function installDependencies() {
  logStep('2', 'Installing Dependencies');
  
  logInfo('Installing Electron dependencies...');
  const installResult = runCommand('npm install', 'electron');
  if (!installResult.success) {
    logError('Failed to install Electron dependencies');
    return false;
  }
  logSuccess('Electron dependencies installed');
  
  return true;
}

// Build for specific platform
function buildForPlatform(platform) {
  const platformConfig = buildConfig.platforms[platform];
  if (!platformConfig) {
    logError(`Unknown platform: ${platform}`);
    return false;
  }
  
  logStep('3', `Building for ${platformConfig.name}`);
  
  // Check if we can build for this platform
  if (platform === 'mac' && buildConfig.currentPlatform !== 'darwin') {
    logWarning('macOS builds can only be created on macOS');
    return false;
  }
  
  if (platform === 'win' && buildConfig.currentPlatform === 'darwin') {
    logWarning('Windows builds on macOS require additional setup');
  }
  
  // Build command
  const buildCommand = `npm run dist-${platform}`;
  logInfo(`Running: ${buildCommand}`);
  
  const buildResult = runCommand(buildCommand, 'electron');
  if (!buildResult.success) {
    logError(`Failed to build for ${platformConfig.name}`);
    return false;
  }
  
  logSuccess(`Successfully built for ${platformConfig.name}`);
  
  // List generated files
  const distPath = path.join('electron', 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    logInfo('Generated files:');
    files.forEach(file => {
      logInfo(`  - ${file}`);
    });
  }
  
  return true;
}

// Build for all platforms
function buildAllPlatforms() {
  logStep('3', 'Building for All Platforms');
  
  const platforms = Object.keys(buildConfig.platforms);
  let successCount = 0;
  
  for (const platform of platforms) {
    logInfo(`Building for ${buildConfig.platforms[platform].name}...`);
    if (buildForPlatform(platform)) {
      successCount++;
    }
  }
  
  logSuccess(`Built for ${successCount}/${platforms.length} platforms`);
  return successCount > 0;
}

// Create portable package
function createPortablePackage() {
  logStep('4', 'Creating Portable Package');
  
  logInfo('Creating portable Windows package...');
  const portableResult = runCommand('npm run pack-win', 'electron');
  if (!portableResult.success) {
    logWarning('Failed to create portable package');
    return false;
  }
  
  logSuccess('Portable package created');
  return true;
}

// Main build function
async function main() {
  log(`${colors.bright}${colors.magenta}🔨 MOHR HR System - Electron Build${colors.reset}`);
  log(`${colors.cyan}Building desktop application for distribution${colors.reset}\n`);
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const platform = args[0];
  const buildAll = args.includes('--all');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  // Install dependencies
  if (!installDependencies()) {
    process.exit(1);
  }
  
  // Build based on arguments
  let buildSuccess = false;
  
  if (buildAll) {
    buildSuccess = buildAllPlatforms();
  } else if (platform) {
    buildSuccess = buildForPlatform(platform);
  } else {
    // Build for current platform
    const currentPlatform = buildConfig.currentPlatform === 'win32' ? 'win' : 
                           buildConfig.currentPlatform === 'darwin' ? 'mac' : 'linux';
    buildSuccess = buildForPlatform(currentPlatform);
  }
  
  if (buildSuccess) {
    // Create portable package if on Windows
    if (buildConfig.currentPlatform === 'win32') {
      createPortablePackage();
    }
    
    log(`\n${colors.bright}${colors.green}🎉 Build completed successfully!${colors.reset}`);
    log(`${colors.cyan}Check the electron/dist directory for generated files.${colors.reset}`);
  } else {
    log(`\n${colors.bright}${colors.red}❌ Build failed!${colors.reset}`);
    process.exit(1);
  }
}

// Show help
function showHelp() {
  log(`${colors.bright}${colors.cyan}Usage:${colors.reset}`);
  log(`  node scripts/build-electron.js [platform] [options]`);
  log(``);
  log(`${colors.bright}${colors.cyan}Platforms:${colors.reset}`);
  log(`  win     - Build for Windows`);
  log(`  mac     - Build for macOS`);
  log(`  linux   - Build for Linux`);
  log(``);
  log(`${colors.bright}${colors.cyan}Options:${colors.reset}`);
  log(`  --all   - Build for all platforms`);
  log(`  --help  - Show this help`);
  log(``);
  log(`${colors.bright}${colors.cyan}Examples:${colors.reset}`);
  log(`  node scripts/build-electron.js          # Build for current platform`);
  log(`  node scripts/build-electron.js win      # Build for Windows`);
  log(`  node scripts/build-electron.js --all    # Build for all platforms`);
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run main function
main().catch((error) => {
  logError(`Build failed: ${error.message}`);
  process.exit(1);
});

module.exports = {
  buildForPlatform,
  buildAllPlatforms,
  checkPrerequisites,
  installDependencies
}; 