#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MOHR HR System - Render Deployment Helper\n');

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  // Check if we're in a git repository
  try {
    execSync('git status', { stdio: 'pipe' });
    console.log('✅ Git repository found');
  } catch (e) {
    console.log('❌ Not a Git repository');
    console.log('   Please run: git init && git add . && git commit -m "Initial commit"');
    return false;
  }
  
  // Check if we have a remote origin
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`✅ Remote origin: ${remoteUrl}`);
  } catch (e) {
    console.log('❌ No remote origin found');
    console.log('   Please add your GitHub repository:');
    console.log('   git remote add origin https://github.com/yourusername/mohr-hr-system.git');
    return false;
  }
  
  // Check if we have uncommitted changes
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log('⚠️  You have uncommitted changes');
      console.log('   Please commit them first:');
      console.log('   git add . && git commit -m "Prepare for deployment"');
      return false;
    }
    console.log('✅ No uncommitted changes');
  } catch (e) {
    console.log('❌ Error checking git status');
    return false;
  }
  
  return true;
}

function showDeploymentSteps() {
  console.log('\n📋 Render Deployment Steps:\n');
  
  console.log('1. 🌐 Go to Render Dashboard');
  console.log('   https://dashboard.render.com\n');
  
  console.log('2. ➕ Create New Web Service');
  console.log('   • Click "New +" → "Web Service"');
  console.log('   • Connect your GitHub account');
  console.log('   • Select your MOHR repository\n');
  
  console.log('3. ⚙️  Configure Settings:');
  console.log('   • Name: mohr-hr-system');
  console.log('   • Environment: Node');
  console.log('   • Region: Choose closest to you');
  console.log('   • Branch: main');
  console.log('   • Root Directory: (leave empty)');
  console.log('   • Build Command: npm install && npm run build:frontend');
  console.log('   • Start Command: npm run start:backend\n');
  
  console.log('4. 🔧 Environment Variables:');
  console.log('   • NODE_ENV = production');
  console.log('   • PORT = 5000');
  console.log('   • HOST = 0.0.0.0');
  console.log('   • JWT_SECRET = (generate a secure secret)');
  console.log('   • DB_TYPE = sqlite');
  console.log('   • CORS_ORIGIN = *\n');
  
  console.log('5. 💰 Instance Type:');
  console.log('   • Free: For testing');
  console.log('   • Paid: For production use\n');
  
  console.log('6. 🚀 Deploy:');
  console.log('   • Click "Create Web Service"');
  console.log('   • Wait for deployment to complete\n');
}

function showPostDeployment() {
  console.log('\n🎉 Post-Deployment:\n');
  
  console.log('✅ Your app will be available at:');
  console.log('   https://your-app-name.onrender.com\n');
  
  console.log('🔐 Default login credentials:');
  console.log('   • Username: admin');
  console.log('   • Password: admin123\n');
  
  console.log('📊 Monitor your deployment:');
  console.log('   • Logs: Available in Render dashboard');
  console.log('   • Health check: /api/health endpoint\n');
  
  console.log('🔄 To update your deployment:');
  console.log('   • Push changes to GitHub');
  console.log('   • Render will auto-redeploy\n');
}

function showTroubleshooting() {
  console.log('\n🔧 Troubleshooting:\n');
  
  console.log('❌ Build fails:');
  console.log('   • Check build logs in Render dashboard');
  console.log('   • Ensure all dependencies are in package.json\n');
  
  console.log('❌ App won\'t start:');
  console.log('   • Verify start command: npm run start:backend');
  console.log('   • Check environment variables\n');
  
  console.log('❌ Database issues:');
  console.log('   • SQLite database is created automatically');
  console.log('   • Ensure write permissions\n');
  
  console.log('❌ CORS errors:');
  console.log('   • Set CORS_ORIGIN to * or your domain\n');
}

function main() {
  console.log('🎯 MOHR HR System - Render Deployment\n');
  
  if (!checkPrerequisites()) {
    console.log('\n❌ Prerequisites not met. Please fix the issues above.\n');
    process.exit(1);
  }
  
  showDeploymentSteps();
  showPostDeployment();
  showTroubleshooting();
  
  console.log('\n📚 Additional Resources:');
  console.log('   • Render Docs: https://docs.render.com');
  console.log('   • MOHR Docs: RENDER-DEPLOYMENT.md');
  console.log('   • GitHub: https://github.com/MoteOoMatthew/MOHR\n');
  
  console.log('🚀 Ready to deploy! Follow the steps above.\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  showDeploymentSteps,
  showPostDeployment,
  showTroubleshooting
}; 