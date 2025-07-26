#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Deployment scenarios
const scenarios = {
  development: {
    description: 'Local development setup',
    env: 'development',
    commands: [
      'npm start'
    ]
  },
  
  local_network: {
    description: 'Local network deployment (accessible from other devices on network)',
    env: 'local_network',
    commands: [
      'NODE_ENV=local_network npm start'
    ]
  },
  
  production: {
    description: 'Production deployment',
    env: 'production',
    commands: [
      'NODE_ENV=production npm start'
    ]
  },
  
  remote: {
    description: 'Remote server deployment',
    env: 'remote',
    commands: [
      'NODE_ENV=remote npm start'
    ]
  },
  
  electron: {
    description: 'Build Electron desktop application',
    env: 'production',
    commands: [
      'cd ../electron && npm install',
      'cd ../frontend && npm install && npm run build',
      'cd ../electron && npm run dist-win'
    ]
  }
};

function checkNodeAndNpm() {
  try {
    execSync('node -v', { stdio: 'ignore' });
    execSync('npm -v', { stdio: 'ignore' });
  } catch (e) {
    console.error('❌ Node.js and npm are required. Please install them from https://nodejs.org/ and try again.');
    process.exit(1);
  }
}

function runCommand(command, cwd = process.cwd()) {
  // Cross-platform: split chained commands for Windows
  if (os.platform() === 'win32' && command.includes('&&')) {
    const parts = command.split('&&').map(s => s.trim());
    for (const part of parts) {
      runCommand(part, cwd);
    }
    return;
  }
  console.log(`\n🔄 Running: ${command}`);
  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    console.log(`✅ Success: ${command}`);
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
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
  console.log('\n🚀 MOHR HR System Deployment Script\n');
  console.log('Usage: node scripts/deploy.js <scenario>\n');
  console.log('Available scenarios:');
  
  Object.entries(scenarios).forEach(([key, scenario]) => {
    console.log(`  ${key.padEnd(15)} - ${scenario.description}`);
  });
  
  console.log('\nExamples:');
  console.log('  node scripts/deploy.js development');
  console.log('  node scripts/deploy.js local_network');
  console.log('  node scripts/deploy.js production');
  console.log('  node scripts/deploy.js electron');
}

// Helper to run npm install in all subprojects
function installAllDependencies() {
  const subdirs = ['backend', 'frontend', 'electron'];
  subdirs.forEach(dir => {
    const pkg = path.join(__dirname, '..', dir, 'package.json');
    if (fs.existsSync(pkg)) {
      console.log(`\n📦 Installing dependencies in ${dir}...`);
      runCommand('npm install', path.join(__dirname, '..', dir));
    } else {
      console.warn(`⚠️  No package.json found in ${dir}, skipping npm install.`);
    }
  });
}

function main() {
  checkNodeAndNpm();
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
  
  // Install dependencies in all subprojects first
  installAllDependencies();

  // Build frontend in correct directory for web/network scenarios
  if (["development", "local_network", "production", "remote"].includes(scenario)) {
    console.log("\n🔄 Building frontend (PWA/web app)...");
    runCommand('npm run build', path.join(__dirname, '..', 'frontend'));
  }

  // Run scenario commands (skip npm install and npm run build-frontend if present)
  selectedScenario.commands.forEach(command => {
    if (command.startsWith('npm install')) return; // Already handled
    if (command.startsWith('npm run build-frontend')) return; // Already handled
    if (command.startsWith('cd ')) {
      const newDir = command.replace('cd ', '');
      runCommand(command.replace('cd ', ''), path.join(__dirname, '..', newDir));
    } else if (command.includes('npm start')) {
      // Run npm start in backend directory
      runCommand(command, path.join(__dirname, '..', 'backend'));
    } else {
      runCommand(command);
    }
  });
  
  // After deployment summary
  console.log(`\n🎉 Deployment completed successfully!`);
  console.log(`📊 Environment: ${selectedScenario.env}`);

  // Mobile/PWA info
  if (["development", "local_network", "production", "remote"].includes(scenario)) {
    console.log(`\n📱 Mobile Access:`);
    console.log(`   - You can access this app from your phone or tablet browser at the same address as your computer.`);
    if (scenario === 'local_network') {
      console.log(`   - On your phone, go to: http://YOUR_IP:5000 (replace YOUR_IP with your computer's IP address)`);
    } else {
      console.log(`   - On your phone, go to: http://localhost:5000 (if on same device)`);
    }
    console.log(`   - This app is a Progressive Web App (PWA): you can 'Add to Home Screen' for an app-like experience!`);
    console.log(`   - Works on iOS, Android, and desktop browsers.`);
  }
  
  if (scenario === 'electron') {
    console.log(`\n💻 Electron app built successfully!`);
    console.log(`📁 Check the electron/dist folder for the installer.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scenarios, runCommand }; 