#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🏗️  MOHR HR System - Production Build\n');

try {
  console.log('📦 Installing backend dependencies...');
  execSync('cd backend && npm install --production', { stdio: 'inherit' });
  
  console.log('📦 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  // Ensure public directory exists and has required files
  console.log('🔧 Ensuring frontend public directory is set up...');
  const publicDir = path.join(__dirname, '..', 'frontend', 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Created public directory');
  }
  
  // Check if index.html exists, if not create a basic one
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('⚠️  index.html not found, creating basic template...');
    const basicHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3b82f6" />
    <meta name="description" content="MOHR HR Management System" />
    <title>MOHR HR System</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
    fs.writeFileSync(indexPath, basicHtml);
    console.log('✅ Created index.html');
  }
  
  console.log('🔨 Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  console.log('✅ Production build completed successfully!');
  console.log('🚀 Ready to start with: npm run start:backend');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 