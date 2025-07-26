#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 MOHR HR System - Simple Deployment Guide\n');

console.log('✅ Your code is already on GitHub: https://github.com/MoteOoMatthew/MOHR.git\n');

console.log('📋 Manual Deployment Steps:\n');

console.log('🌐 STEP 1: Deploy Backend to Railway');
console.log('=====================================');
console.log('1. Go to: https://railway.app');
console.log('2. Sign up/Login with GitHub');
console.log('3. Click "New Project" → "Deploy from GitHub repo"');
console.log('4. Select: MoteOoMatthew/MOHR');
console.log('5. Configure:');
console.log('   • Build Command: npm install && npm run build:frontend');
console.log('   • Start Command: npm run start:backend');
console.log('6. Add Environment Variables:');
console.log('   • NODE_ENV=production');
console.log('   • JWT_SECRET=your-secure-secret-here');
console.log('   • HOST=0.0.0.0');
console.log('   • DB_TYPE=postgres');
console.log('   • DATABASE_URL=postgresql://... (Railway provides)');
console.log('   • CORS_ORIGIN=https://your-frontend-domain.vercel.app');
console.log('7. Add PostgreSQL Database:');
console.log('   • Click "New" → "Database" → "PostgreSQL"');
console.log('   • Railway will provide DATABASE_URL automatically\n');

console.log('🌐 STEP 2: Deploy Frontend to Vercel');
console.log('=====================================');
console.log('1. Go to: https://vercel.com');
console.log('2. Sign up/Login with GitHub');
console.log('3. Click "New Project" → "Import Git Repository"');
console.log('4. Select: MoteOoMatthew/MOHR');
console.log('5. Configure:');
console.log('   • Framework Preset: Create React App');
console.log('   • Root Directory: frontend');
console.log('   • Build Command: npm run build');
console.log('   • Output Directory: build');
console.log('6. Add Environment Variable:');
console.log('   • REACT_APP_API_URL=https://your-backend-domain.railway.app\n');

console.log('🔧 STEP 3: Update CORS Settings');
console.log('================================');
console.log('1. Get your Vercel frontend URL (e.g., https://mohr-hr-system.vercel.app)');
console.log('2. Go back to Railway dashboard');
console.log('3. Update CORS_ORIGIN environment variable with your Vercel URL');
console.log('4. Redeploy the Railway project\n');

console.log('🎯 STEP 4: Test Your Deployment');
console.log('================================');
console.log('1. Visit your Vercel URL');
console.log('2. Login with:');
console.log('   • Username: admin');
console.log('   • Password: admin123');
console.log('3. Test all features\n');

console.log('💡 Pro Tips:');
console.log('=============');
console.log('• Generate a secure JWT secret:');
console.log('  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
console.log('• Monitor deployments in Railway/Vercel dashboards');
console.log('• Set up automatic deployments by connecting GitHub');
console.log('• Use custom domains for production\n');

console.log('🆘 Need Help?');
console.log('==============');
console.log('• Check deployment logs in Railway/Vercel');
console.log('• Verify environment variables are set correctly');
console.log('• Ensure CORS_ORIGIN matches your Vercel URL exactly');
console.log('• See DEPLOYMENT-REMOTE.md for detailed instructions\n');

console.log('🎉 Your MOHR HR System will be live and accessible from anywhere!');
console.log('   Web: https://your-app.vercel.app');
console.log('   API: https://your-app.railway.app\n');

// Generate a secure JWT secret
const crypto = require('crypto');
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('🔐 Generated JWT Secret (use this in Railway):');
console.log(jwtSecret);
console.log('');

// Create a quick reference file
const quickRef = `# MOHR HR System - Quick Deployment Reference

## URLs
- GitHub Repository: https://github.com/MoteOoMatthew/MOHR.git
- Railway Dashboard: https://railway.app
- Vercel Dashboard: https://vercel.com

## Environment Variables

### Railway (Backend)
NODE_ENV=production
JWT_SECRET=${jwtSecret}
HOST=0.0.0.0
DB_TYPE=postgres
DATABASE_URL=postgresql://... (Railway provides)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

### Vercel (Frontend)
REACT_APP_API_URL=https://your-backend-domain.railway.app

## Build Commands

### Railway
Build: npm install && npm run build:frontend
Start: npm run start:backend

### Vercel
Build: npm run build
Root Directory: frontend
Output Directory: build

## Default Login
Username: admin
Password: admin123
`;

fs.writeFileSync(path.join(__dirname, '..', 'DEPLOYMENT-QUICK-REF.md'), quickRef);
console.log('📝 Created DEPLOYMENT-QUICK-REF.md with all the details!'); 