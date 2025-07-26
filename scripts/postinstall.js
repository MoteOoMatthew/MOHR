#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 MOHR HR System - Post-install Setup\n');

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
      console.log('💡 You may need to run this manually:');
      console.log('   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force');
    }
  }
}

function createEnvironmentFile() {
  console.log('📝 Creating environment file...');
  
  const envContent = `# MOHR HR System Environment Configuration
NODE_ENV=development
PORT=5000
JWT_SECRET=mohr-secret-key-change-this-in-production
HOST=localhost

# Database Configuration
DB_TYPE=sqlite
DB_PATH=backend/mohr.db

# Security Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_ENABLED=false

# Email Configuration (for future features)
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Google Integration (for future features)
GOOGLE_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
`;

  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file created');
  } else {
    console.log('ℹ️ Environment file already exists');
  }
}

function createDirectories() {
  console.log('📁 Creating necessary directories...');
  
  const dirs = [
    'logs',
    'uploads',
    'backups',
    'temp'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

function checkNodeVersion() {
  console.log('🔍 Checking Node.js version...');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const version = nodeVersion.replace('v', '');
    const major = parseInt(version.split('.')[0]);
    
    if (major >= 14) {
      console.log(`✅ Node.js version ${version} is compatible`);
    } else {
      console.warn(`⚠️ Node.js version ${version} may be too old`);
      console.log('💡 Recommended: Node.js 14.0.0 or higher');
    }
  } catch (e) {
    console.error('❌ Could not check Node.js version');
  }
}

function createGitignore() {
  console.log('📝 Creating .gitignore file...');
  
  const gitignoreContent = `# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
build/
dist/
*/build/
*/dist/

# Database files
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary files
temp/
tmp/
*.tmp

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Electron build artifacts
out/
app/
`;

  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ .gitignore file created');
  } else {
    console.log('ℹ️ .gitignore file already exists');
  }
}

function main() {
  try {
    checkNodeVersion();
    fixPowerShellExecutionPolicy();
    createEnvironmentFile();
    createDirectories();
    createGitignore();
    
    console.log('\n🎉 Post-install setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm start" to start the development server');
    console.log('2. Run "npm run electron" to build the desktop app');
    console.log('3. Run "npm run desktop" to launch the desktop app');
    console.log('\n💡 For more information, see DEPLOYMENT-IMPROVED.md');
    
  } catch (error) {
    console.error('\n❌ Post-install setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 