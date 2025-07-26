#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🌐 MOHR HR System - Remote Deployment Helper\n');

const platforms = {
  vercel_railway: {
    name: 'Vercel + Railway',
    description: 'Easiest deployment (Recommended)',
    cost: '$10-20/month',
    setup_time: '30 minutes'
  },
  digitalocean: {
    name: 'DigitalOcean App Platform',
    description: 'Simple managed deployment',
    cost: '$25-50/month',
    setup_time: '1 hour'
  },
  vps: {
    name: 'VPS (Self-hosted)',
    description: 'Full control, cost-effective',
    cost: '$5-20/month',
    setup_time: '2 hours'
  },
  aws: {
    name: 'AWS/GCP/Azure',
    description: 'Enterprise-grade deployment',
    cost: '$100-500+/month',
    setup_time: '1 day'
  }
};

function showPlatforms() {
  console.log('📋 Available Deployment Platforms:\n');
  
  Object.entries(platforms).forEach(([key, platform]) => {
    console.log(`🔹 ${platform.name}`);
    console.log(`   ${platform.description}`);
    console.log(`   💰 Cost: ${platform.cost}`);
    console.log(`   ⏱️  Setup: ${platform.setup_time}`);
    console.log(`   🎯 Command: npm run deploy:${key}\n`);
  });
}

function checkGitStatus() {
  console.log('🔍 Checking Git repository status...');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log('⚠️  You have uncommitted changes. Please commit them first:');
      console.log('   git add .');
      console.log('   git commit -m "Prepare for deployment"');
      return false;
    }
    
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`✅ Git repository is clean (branch: ${currentBranch})`);
    return true;
  } catch (e) {
    console.log('❌ Not a Git repository. Please initialize Git first:');
    console.log('   git init');
    console.log('   git add .');
    console.log('   git commit -m "Initial commit"');
    return false;
  }
}

function checkRemoteOrigin() {
  console.log('🔍 Checking remote origin...');
  
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`✅ Remote origin: ${remoteUrl}`);
    return true;
  } catch (e) {
    console.log('❌ No remote origin found. Please add one:');
    console.log('   git remote add origin https://github.com/yourusername/mohr-hr-system.git');
    return false;
  }
}

function prepareForDeployment() {
  console.log('🔧 Preparing for deployment...\n');
  
  // Check if .env.production exists
  const envProdPath = path.join(__dirname, '..', '.env.production');
  if (!fs.existsSync(envProdPath)) {
    console.log('📝 Creating .env.production template...');
    const envProdContent = `# Production Environment Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_SECRET
HOST=0.0.0.0

# Database Configuration (Update with your production database)
DB_TYPE=postgres
DATABASE_URL=postgresql://username:password@host:port/database

# Security Configuration
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_ENABLED=true

# Email Configuration (for future features)
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
`;
    fs.writeFileSync(envProdPath, envProdContent);
    console.log('✅ Created .env.production template');
  }
  
  // Check if .gitignore includes .env files
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.env')) {
      console.log('📝 Adding .env files to .gitignore...');
      fs.appendFileSync(gitignorePath, '\n# Environment files\n.env\n.env.*\n!.env.example\n');
      console.log('✅ Updated .gitignore');
    }
  }
  
  // Create deployment scripts
  createDeploymentScripts();
}

function createDeploymentScripts() {
  console.log('📝 Creating deployment scripts...');
  
  const scriptsDir = path.join(__dirname, '..', 'scripts');
  
  // Vercel + Railway deployment script
  const vercelRailwayScript = `#!/bin/bash
echo "🚀 Deploying to Vercel + Railway..."

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://railway.app and create a new project"
echo "2. Connect your GitHub repository"
echo "3. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET=your-secure-secret"
echo "   - DATABASE_URL=postgresql://... (Railway will provide)"
echo "   - CORS_ORIGIN=https://your-frontend-domain.vercel.app"
echo "4. Set build command: npm install && npm run build:frontend"
echo "5. Set start command: npm run start:backend"
echo ""
echo "6. Go to https://vercel.com and import your repository"
echo "7. Set root directory to 'frontend'"
echo "8. Add environment variable: REACT_APP_API_URL=https://your-backend-domain.railway.app"
echo ""
echo "🎉 Your app will be deployed automatically!"
`;
  
  fs.writeFileSync(path.join(scriptsDir, 'deploy-vercel-railway.sh'), vercelRailwayScript);
  if (os.platform() !== 'win32') {
    execSync(`chmod +x "${path.join(scriptsDir, 'deploy-vercel-railway.sh')}"`);
  }
  
  // DigitalOcean deployment script
  const digitalOceanScript = `#!/bin/bash
echo "🚀 Deploying to DigitalOcean App Platform..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl CLI not found. Please install it first:"
    echo "   https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if do-app.yaml exists
if [ ! -f "do-app.yaml" ]; then
    echo "❌ do-app.yaml not found. Please create it first."
    echo "   See DEPLOYMENT-REMOTE.md for details."
    exit 1
fi

# Deploy to DigitalOcean
echo "📤 Deploying to DigitalOcean..."
doctl apps create --spec do-app.yaml

echo "✅ Deployment initiated!"
echo "Check your DigitalOcean dashboard for status."
`;
  
  fs.writeFileSync(path.join(scriptsDir, 'deploy-digitalocean.sh'), digitalOceanScript);
  if (os.platform() !== 'win32') {
    execSync(`chmod +x "${path.join(scriptsDir, 'deploy-digitalocean.sh')}"`);
  }
  
  console.log('✅ Created deployment scripts');
}

function deployVercelRailway() {
  console.log('🚀 Deploying to Vercel + Railway...\n');
  
  if (!checkGitStatus() || !checkRemoteOrigin()) {
    return;
  }
  
  prepareForDeployment();
  
  console.log('📤 Pushing to GitHub...');
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Prepare for Vercel + Railway deployment"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Code pushed to GitHub\n');
  } catch (e) {
    console.log('❌ Failed to push to GitHub');
    return;
  }
  
  console.log('📋 Next steps:');
  console.log('');
  console.log('1. 🌐 Go to https://railway.app');
  console.log('   - Create a new project');
  console.log('   - Connect your GitHub repository');
  console.log('   - Set environment variables:');
  console.log('     • NODE_ENV=production');
  console.log('     • JWT_SECRET=your-secure-secret');
  console.log('     • DATABASE_URL=postgresql://... (Railway will provide)');
  console.log('     • CORS_ORIGIN=https://your-frontend-domain.vercel.app');
  console.log('   - Set build command: npm install && npm run build:frontend');
  console.log('   - Set start command: npm run start:backend');
  console.log('');
  console.log('2. 🌐 Go to https://vercel.com');
  console.log('   - Import your repository');
  console.log('   - Set root directory to "frontend"');
  console.log('   - Add environment variable: REACT_APP_API_URL=https://your-backend-domain.railway.app');
  console.log('');
  console.log('🎉 Your app will be deployed automatically!');
}

function deployDigitalOcean() {
  console.log('🚀 Deploying to DigitalOcean App Platform...\n');
  
  if (!checkGitStatus() || !checkRemoteOrigin()) {
    return;
  }
  
  prepareForDeployment();
  
  // Check if do-app.yaml exists
  const doAppPath = path.join(__dirname, '..', 'do-app.yaml');
  if (!fs.existsSync(doAppPath)) {
    console.log('📝 Creating do-app.yaml...');
    const doAppContent = `name: mohr-hr-system
services:
- name: backend
  source_dir: /backend
  github:
    repo: yourusername/mohr-hr-system
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-super-secure-jwt-secret
  - key: DATABASE_URL
    value: \${db.DATABASE_URL}

- name: frontend
  source_dir: /frontend
  github:
    repo: yourusername/mohr-hr-system
    branch: main
  run_command: npm run build && npx serve -s build -l 3000
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: REACT_APP_API_URL
    value: https://backend-\${app.name}.ondigitalocean.app

databases:
- name: db
  engine: PG
  version: "12"
`;
    fs.writeFileSync(doAppPath, doAppContent);
    console.log('✅ Created do-app.yaml');
    console.log('⚠️  Please update the GitHub repository URL in do-app.yaml');
  }
  
  console.log('📋 Next steps:');
  console.log('');
  console.log('1. 🔧 Install doctl CLI:');
  console.log('   https://docs.digitalocean.com/reference/doctl/how-to/install/');
  console.log('');
  console.log('2. 🔑 Authenticate with DigitalOcean:');
  console.log('   doctl auth init');
  console.log('');
  console.log('3. 📝 Update do-app.yaml with your GitHub repository URL');
  console.log('');
  console.log('4. 🚀 Deploy:');
  console.log('   doctl apps create --spec do-app.yaml');
  console.log('');
  console.log('🎉 Your app will be deployed to DigitalOcean!');
}

function deployVPS() {
  console.log('🚀 Preparing VPS deployment...\n');
  
  prepareForDeployment();
  
  console.log('📋 VPS Deployment Instructions:');
  console.log('');
  console.log('1. 🖥️  Set up your VPS (Ubuntu 20.04 recommended)');
  console.log('');
  console.log('2. 📦 Install required software:');
  console.log('   sudo apt update && sudo apt upgrade -y');
  console.log('   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -');
  console.log('   sudo apt-get install -y nodejs postgresql postgresql-contrib nginx');
  console.log('   sudo npm install -g pm2');
  console.log('');
  console.log('3. 🗄️  Set up PostgreSQL database');
  console.log('4. 📁 Clone your repository');
  console.log('5. ⚙️  Configure environment variables');
  console.log('6. 🔧 Set up Nginx and SSL');
  console.log('');
  console.log('📖 See DEPLOYMENT-REMOTE.md for detailed VPS setup instructions');
}

function showHelp() {
  console.log('🌐 MOHR HR System - Remote Deployment Helper\n');
  console.log('Usage:');
  console.log('  npm run deploy:remote [platform]');
  console.log('');
  console.log('Platforms:');
  Object.entries(platforms).forEach(([key, platform]) => {
    console.log(`  ${key} - ${platform.name} (${platform.description})`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  npm run deploy:remote vercel_railway');
  console.log('  npm run deploy:remote digitalocean');
  console.log('  npm run deploy:remote vps');
  console.log('');
  console.log('For more information, see DEPLOYMENT-REMOTE.md');
}

function main() {
  const args = process.argv.slice(2);
  const platform = args[0];
  
  if (!platform || platform === 'help' || platform === '--help' || platform === '-h') {
    showPlatforms();
    showHelp();
    return;
  }
  
  switch (platform) {
    case 'vercel_railway':
      deployVercelRailway();
      break;
    case 'digitalocean':
      deployDigitalOcean();
      break;
    case 'vps':
      deployVPS();
      break;
    case 'list':
      showPlatforms();
      break;
    default:
      console.log(`❌ Unknown platform: ${platform}`);
      showPlatforms();
      showHelp();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, platforms }; 