#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🏗️  MOHR HR System - Copy Build\n');

try {
  // Step 1: Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Ensure frontend public directory exists
  console.log('🔧 Setting up frontend public directory...');
  const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
  if (!fs.existsSync(frontendPublicDir)) {
    fs.mkdirSync(frontendPublicDir, { recursive: true });
    console.log('✅ Created frontend/public directory');
  }
  
  // Step 3: Copy index.html from root public to frontend public
  console.log('📋 Copying index.html...');
  const rootIndexPath = path.join(__dirname, '..', 'public', 'index.html');
  const frontendIndexPath = path.join(frontendPublicDir, 'index.html');
  
  if (fs.existsSync(rootIndexPath)) {
    fs.copyFileSync(rootIndexPath, frontendIndexPath);
    console.log('✅ Copied index.html to frontend/public/');
  } else {
    console.log('⚠️  Root index.html not found, creating basic one...');
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
    fs.writeFileSync(frontendIndexPath, basicHtml);
    console.log('✅ Created basic index.html in frontend/public/');
  }
  
  // Step 4: Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  // Step 5: Build frontend
  console.log('🔨 Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  // Step 6: Install backend dependencies
  console.log('📦 Installing backend dependencies...');
  execSync('cd backend && npm install --production', { stdio: 'inherit' });
  
  console.log('✅ Copy build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 