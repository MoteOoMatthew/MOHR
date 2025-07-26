#!/usr/bin/env node

/**
 * MOHR HR System - Clean Installation Test Script
 * 
 * This script simulates a clean machine installation to verify:
 * - All dependencies install correctly
 * - System builds successfully
 * - Server starts and responds
 * - Frontend loads properly
 * - Database initializes correctly
 * - Mobile responsiveness works
 * - All deployment scenarios function
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

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

// Test configuration
const testConfig = {
  serverPort: 5000,
  frontendPort: 3000,
  timeout: 30000, // 30 seconds
  retries: 3
};

// Helper function to run commands
function runCommand(command, cwd = process.cwd(), silent = false) {
  try {
    const options = {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      timeout: testConfig.timeout
    };
    
    const result = execSync(command, options);
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Helper function to wait for server to be ready
function waitForServer(url, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkServer = () => {
      attempts++;
      
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          if (attempts >= maxAttempts) {
            reject(new Error(`Server responded with status ${res.statusCode}`));
          } else {
            setTimeout(checkServer, 1000);
          }
        }
      }).on('error', (err) => {
        if (attempts >= maxAttempts) {
          reject(err);
        } else {
          setTimeout(checkServer, 1000);
        }
      });
    };
    
    checkServer();
  });
}

// Test 1: Check prerequisites
async function testPrerequisites() {
  logStep('1', 'Checking Prerequisites');
  
  // Check Node.js version
  const nodeResult = runCommand('node --version', '.', true);
  if (nodeResult.success) {
    const version = nodeResult.output.toString().trim();
    logSuccess(`Node.js version: ${version}`);
    
    // Check if version is >= 14
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    if (majorVersion >= 14) {
      logSuccess('Node.js version is compatible (>= 14)');
    } else {
      logError('Node.js version must be >= 14');
      return false;
    }
  } else {
    logError('Node.js is not installed or not in PATH');
    return false;
  }
  
  // Check npm version
  const npmResult = runCommand('npm --version', '.', true);
  if (npmResult.success) {
    const version = npmResult.output.toString().trim();
    logSuccess(`npm version: ${version}`);
  } else {
    logError('npm is not installed or not in PATH');
    return false;
  }
  
  // Check if ports are available
  const serverPortAvailable = await isPortAvailable(testConfig.serverPort);
  if (serverPortAvailable) {
    logSuccess(`Port ${testConfig.serverPort} is available`);
  } else {
    logWarning(`Port ${testConfig.serverPort} is in use - test may fail`);
  }
  
  return true;
}

// Test 2: Clean installation
async function testCleanInstallation() {
  logStep('2', 'Testing Clean Installation');
  
  // Remove node_modules if they exist (with better error handling)
  const dirs = ['node_modules', 'backend/node_modules', 'frontend/node_modules', 'electron/node_modules'];
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      try {
        logInfo(`Removing existing ${dir}`);
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (error) {
        logWarning(`Could not remove ${dir}: ${error.message}`);
        // Continue with test even if removal fails
      }
    }
  }
  
  // Install root dependencies
  logInfo('Installing root dependencies...');
  const rootInstall = runCommand('npm install');
  if (!rootInstall.success) {
    logError('Failed to install root dependencies');
    return false;
  }
  logSuccess('Root dependencies installed');
  
  // Install backend dependencies
  logInfo('Installing backend dependencies...');
  const backendInstall = runCommand('npm install', 'backend');
  if (!backendInstall.success) {
    logError('Failed to install backend dependencies');
    return false;
  }
  logSuccess('Backend dependencies installed');
  
  // Install frontend dependencies
  logInfo('Installing frontend dependencies...');
  const frontendInstall = runCommand('npm install', 'frontend');
  if (!frontendInstall.success) {
    logError('Failed to install frontend dependencies');
    return false;
  }
  logSuccess('Frontend dependencies installed');
  
  // Install electron dependencies
  logInfo('Installing electron dependencies...');
  const electronInstall = runCommand('npm install', 'electron');
  if (!electronInstall.success) {
    logError('Failed to install electron dependencies');
    return false;
  }
  logSuccess('Electron dependencies installed');
  
  return true;
}

// Test 3: Build frontend
async function testFrontendBuild() {
  logStep('3', 'Testing Frontend Build');
  
  logInfo('Building frontend...');
  const buildResult = runCommand('npm run build', 'frontend');
  if (!buildResult.success) {
    logError('Frontend build failed');
    return false;
  }
  
  // Check if build directory exists
  const buildDir = path.join('frontend', 'build');
  if (fs.existsSync(buildDir)) {
    logSuccess('Frontend build directory created');
    
    // Check for essential files
    const essentialFiles = ['index.html', 'static/js', 'static/css'];
    for (const file of essentialFiles) {
      const filePath = path.join(buildDir, file);
      if (fs.existsSync(filePath)) {
        logSuccess(`Build file exists: ${file}`);
      } else {
        logWarning(`Build file missing: ${file}`);
      }
    }
  } else {
    logError('Frontend build directory not found');
    return false;
  }
  
  return true;
}

// Test 4: Database initialization
async function testDatabaseInitialization() {
  logStep('4', 'Testing Database Initialization');
  
  // Remove existing database
  const dbPath = path.join('backend', 'mohr.db');
  if (fs.existsSync(dbPath)) {
    logInfo('Removing existing database');
    fs.unlinkSync(dbPath);
  }
  
  // Start server briefly to initialize database
  logInfo('Starting server to initialize database...');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: 'backend',
    stdio: 'pipe'
  });
  
  let serverStarted = false;
  let dbInitialized = false;
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      serverProcess.kill();
      if (!dbInitialized) {
        logError('Database initialization timeout');
        resolve(false);
      }
    }, 10000);
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Database tables initialized')) {
        dbInitialized = true;
        logSuccess('Database tables initialized');
      }
      if (output.includes('MOHR HR System server running')) {
        serverStarted = true;
        logSuccess('Server started successfully');
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('Warning')) {
        logWarning(`Server warning: ${error.trim()}`);
      }
    });
    
    // Wait a bit for database initialization, then kill server
    setTimeout(() => {
      clearTimeout(timeout);
      serverProcess.kill();
      
      // Check if database file was created
      if (fs.existsSync(dbPath)) {
        logSuccess('Database file created');
        resolve(true);
      } else {
        logError('Database file not created');
        resolve(false);
      }
    }, 3000);
  });
}

// Test 5: Server functionality
async function testServerFunctionality() {
  logStep('5', 'Testing Server Functionality');
  
  // Start server
  logInfo('Starting server...');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: 'backend',
    stdio: 'pipe'
  });
  
  let serverReady = false;
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      serverProcess.kill();
      if (!serverReady) {
        logError('Server startup timeout');
        resolve(false);
      }
    }, 15000);
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('MOHR HR System server running')) {
        serverReady = true;
        logSuccess('Server is running');
      }
    });
    
    // Wait for server to be ready, then test endpoints
    setTimeout(async () => {
      if (serverReady) {
        try {
          // Test health endpoint
          logInfo('Testing health endpoint...');
          await waitForServer(`http://localhost:${testConfig.serverPort}/api/health`);
          logSuccess('Health endpoint responding');
          
          // Test frontend serving
          logInfo('Testing frontend serving...');
          await waitForServer(`http://localhost:${testConfig.serverPort}/`);
          logSuccess('Frontend being served');
          
          clearTimeout(timeout);
          serverProcess.kill();
          resolve(true);
        } catch (error) {
          clearTimeout(timeout);
          serverProcess.kill();
          logError(`Server test failed: ${error.message}`);
          resolve(false);
        }
      } else {
        clearTimeout(timeout);
        serverProcess.kill();
        logError('Server failed to start');
        resolve(false);
      }
    }, 2000);
  });
}

// Test 6: Deployment scenarios
async function testDeploymentScenarios() {
  logStep('6', 'Testing Deployment Scenarios');
  
  const scenarios = ['development', 'local_network', 'production'];
  let allPassed = true;
  
  for (const scenario of scenarios) {
    logInfo(`Testing ${scenario} scenario...`);
    
    // Test deployment script
    const deployResult = runCommand(`node scripts/deploy.js ${scenario}`, '.', true);
    if (deployResult.success) {
      logSuccess(`${scenario} scenario: deployment script works`);
    } else {
      logWarning(`${scenario} scenario: deployment script had issues`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 7: Mobile responsiveness check
async function testMobileResponsiveness() {
  logStep('7', 'Testing Mobile Responsiveness');
  
  // Check if PWA manifest exists
  const manifestPath = path.join('frontend', 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    logSuccess('PWA manifest exists');
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.name && manifest.short_name) {
        logSuccess('PWA manifest is valid');
      } else {
        logWarning('PWA manifest missing required fields');
      }
    } catch (error) {
      logError('PWA manifest is not valid JSON');
    }
  } else {
    logError('PWA manifest not found');
  }
  
  // Check for mobile-specific CSS
  const cssPath = path.join('frontend', 'src', 'index.css');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    if (cssContent.includes('@media') && cssContent.includes('mobile')) {
      logSuccess('Mobile-responsive CSS found');
    } else {
      logWarning('Mobile-responsive CSS may be incomplete');
    }
  }
  
  return true;
}

// Main test function
async function runAllTests() {
  log(`${colors.bright}${colors.magenta}🧪 MOHR HR System - Clean Installation Test${colors.reset}`);
  log(`${colors.cyan}This script will test the system on a clean machine simulation${colors.reset}\n`);
  
  const tests = [
    { name: 'Prerequisites', fn: testPrerequisites },
    { name: 'Clean Installation', fn: testCleanInstallation },
    { name: 'Frontend Build', fn: testFrontendBuild },
    { name: 'Database Initialization', fn: testDatabaseInitialization },
    { name: 'Server Functionality', fn: testServerFunctionality },
    { name: 'Deployment Scenarios', fn: testDeploymentScenarios },
    { name: 'Mobile Responsiveness', fn: testMobileResponsiveness }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      logError(`Test ${test.name} failed with error: ${error.message}`);
    }
  }
  
  // Summary
  log(`\n${colors.bright}${colors.magenta}📊 Test Summary${colors.reset}`);
  log(`${colors.green}✅ Passed: ${passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    log(`${colors.bright}${colors.green}🎉 All tests passed! The system is ready for deployment.${colors.reset}`);
    return true;
  } else {
    log(`${colors.bright}${colors.red}⚠️  Some tests failed. Please review the issues above.${colors.reset}`);
    return false;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testPrerequisites,
  testCleanInstallation,
  testFrontendBuild,
  testDatabaseInitialization,
  testServerFunctionality,
  testDeploymentScenarios,
  testMobileResponsiveness
}; 