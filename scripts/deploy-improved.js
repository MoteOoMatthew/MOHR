#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Deployment scenarios
const scenarios = {
  development: {
    description: 'Local development setup',
    env: 'development',
    steps: [
      'install_dependencies',
      'build_frontend',
      'start_backend'
    ]
  },
  
  local_network: {
    description: 'Local network deployment (accessible from other devices on network)',
    env: 'local_network',
    steps: [
      'install_dependencies',
      'build_frontend',
      'start_backend'
    ]
  },
  
  production: {
    description: 'Production deployment',
    env: 'production',
    steps: [
      'install_dependencies',
      'build_frontend',
      'start_backend'
    ]
  },
  
  remote: {
    description: 'Remote server deployment',
    env: 'remote',
    steps: [
      'install_dependencies',
      'build_frontend',
      'start_backend'
    ]
  },
  
  electron: {
    description: 'Build Electron desktop application',
    env: 'production',
    steps: [
      'install_dependencies',
      'build_frontend',
      'build_electron'
    ]
  },
  
  desktop: {
    description: 'Launch desktop application',
    env: 'production',
    steps: [
      'check_backend',
      'launch_desktop'
    ]
  }
};

function checkNodeAndNpm() {
  try {
    execSync('node -v', { stdio: 'ignore' });
    execSync('npm -v', { stdio: 'ignore' });
    console.log('✅ Node.js and npm are available');
  } catch (e) {
    console.error('❌ Node.js and npm are required. Please install them from https://nodejs.org/ and try again.');
    process.exit(1);
  }
}

function fixPowerShellExecutionPolicy() {
  if (os.platform() === 'win32') {
    try {
      console.log('🔧 Fixing PowerShell execution policy...');
      execSync('Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force', {
        stdio: 'ignore',
        shell: 'powershell.exe'
      });
      console.log('✅ PowerShell execution policy fixed');
    } catch (e) {
      console.warn('⚠️ Could not fix PowerShell execution policy automatically. You may need to run this manually.');
    }
  }
}

function killExistingProcesses() {
  try {
    console.log('🔄 Stopping existing processes...');
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

function runCommand(command, cwd = process.cwd(), options = {}) {
  console.log(`\n🔄 Running: ${command}`);
  console.log(`📁 Directory: ${cwd}`);
  
  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
      shell: true,
      ...options
    });
    console.log(`✅ Success: ${command}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
    if (options.continueOnError) {
      return false;
    }
    process.exit(1);
  }
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  const subdirs = ['backend', 'frontend', 'electron'];
  subdirs.forEach(dir => {
    const pkgPath = path.join(__dirname, '..', dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      console.log(`\n📦 Installing dependencies in ${dir}...`);
      runCommand('npm install', path.join(__dirname, '..', dir));
    } else {
      console.warn(`⚠️  No package.json found in ${dir}, skipping npm install.`);
    }
  });
}

function buildFrontend() {
  console.log('\n🔨 Building frontend...');
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  // Check if build directory exists and is recent
  const buildPath = path.join(frontendPath, 'build');
  const buildExists = fs.existsSync(buildPath);
  
  if (buildExists) {
    const buildStats = fs.statSync(buildPath);
    const buildAge = Date.now() - buildStats.mtime.getTime();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    if (buildAge < maxAge) {
      console.log('✅ Frontend build is recent, skipping rebuild');
      return;
    }
  }
  
  runCommand('npm run build', frontendPath);
}

function buildElectron() {
  console.log('\n🔨 Building Electron desktop application...');
  const electronPath = path.join(__dirname, '..', 'electron');
  
  // Build frontend first if not already built
  buildFrontend();
  
  // Build Electron app
  runCommand('npm run dist-win', electronPath);
}

function startBackend() {
  console.log('\n🚀 Starting backend server...');
  const backendPath = path.join(__dirname, '..', 'backend');
  
  // Kill any existing processes first
  killExistingProcesses();
  
  // Start backend in background
  const backendProcess = spawn('node', ['server.js'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: scenarios[process.argv[2]].env }
  });
  
  // Wait a moment for server to start
  setTimeout(() => {
    console.log('\n🎉 Backend server started successfully!');
    console.log('📊 Health check: http://localhost:5000/api/health');
    console.log('🌐 Application: http://localhost:5000');
    console.log('\n💡 Press Ctrl+C to stop the server');
  }, 3000);
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    backendProcess.kill();
    process.exit(0);
  });
  
  backendProcess.on('close', (code) => {
    console.log(`\n🛑 Backend server stopped with code ${code}`);
    process.exit(code);
  });
}

function checkBackend() {
  console.log('\n🔍 Checking if backend is running...');
  try {
    const response = execSync('curl -s http://localhost:5000/api/health', { encoding: 'utf8' });
    if (response.includes('OK')) {
      console.log('✅ Backend is running');
      return true;
    }
  } catch (e) {
    console.log('❌ Backend is not running');
    return false;
  }
  return false;
}

function launchDesktop() {
  console.log('\n🖥️ Launching desktop application...');
  const desktopPath = path.join(__dirname, '..', 'electron', 'dist', 'win-unpacked');
  const exePath = path.join(desktopPath, 'MOHR HR System.exe');
  
  if (!fs.existsSync(exePath)) {
    console.error('❌ Desktop application not found. Please run "node scripts/deploy-improved.js electron" first.');
    process.exit(1);
  }
  
  if (os.platform() === 'win32') {
    runCommand(`"${exePath}"`, desktopPath);
  } else {
    console.error('❌ Desktop application is only available on Windows');
    process.exit(1);
  }
}

function createEnvironmentFile(env) {
  const envFile = path.join(__dirname, '..', '.env');
  const envContent = `NODE_ENV=${env}
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
`;

  if (!fs.existsSync(envFile)) {
    fs.writeFileSync(envFile, envContent);
    console.log('✅ Created .env file');
  }
}

function showHelp() {
  console.log('\n🚀 MOHR HR System - Improved Deployment Script\n');
  console.log('Usage: node scripts/deploy-improved.js <scenario>\n');
  console.log('Available scenarios:');
  
  Object.entries(scenarios).forEach(([key, scenario]) => {
    console.log(`  ${key.padEnd(15)} - ${scenario.description}`);
  });
  
  console.log('\nExamples:');
  console.log('  node scripts/deploy-improved.js development');
  console.log('  node scripts/deploy-improved.js local_network');
  console.log('  node scripts/deploy-improved.js electron');
  console.log('  node scripts/deploy-improved.js desktop');
  
  console.log('\n🔧 This improved script fixes:');
  console.log('  - PowerShell execution policy issues');
  console.log('  - Port conflicts and process management');
  console.log('  - Dependency installation problems');
  console.log('  - Frontend build issues');
  console.log('  - Desktop application launching');
}

function main() {
  checkNodeAndNpm();
  fixPowerShellExecutionPolicy();
  
  const scenario = process.argv[2];
  
  if (!scenario || scenario === 'help' || scenario === '--help' || scenario === '-h') {
    showHelp();
    return;
  }
  
  if (!scenarios[scenario]) {
    console.error(`❌ Unknown scenario: ${scenario}`);
    showHelp();
    process.exit(1);
  }
  
  const selectedScenario = scenarios[scenario];
  
  console.log(`\n🚀 Starting deployment: ${scenario}`);
  console.log(`📝 Description: ${selectedScenario.description}`);
  console.log(`🌐 Environment: ${selectedScenario.env}\n`);
  
  // Create environment file
  createEnvironmentFile(selectedScenario.env);
  
  // Execute steps
  selectedScenario.steps.forEach(step => {
    switch (step) {
      case 'install_dependencies':
        installDependencies();
        break;
      case 'build_frontend':
        buildFrontend();
        break;
      case 'build_electron':
        buildElectron();
        break;
      case 'start_backend':
        startBackend();
        break;
      case 'check_backend':
        if (!checkBackend()) {
          console.error('❌ Backend must be running. Please run "node scripts/deploy-improved.js development" first.');
          process.exit(1);
        }
        break;
      case 'launch_desktop':
        launchDesktop();
        break;
    }
  });
  
  // Success message
  if (scenario !== 'start_backend') {
    console.log(`\n🎉 Deployment completed successfully!`);
    console.log(`📊 Environment: ${selectedScenario.env}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scenarios, runCommand }; 