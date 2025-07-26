#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🏗️  MOHR HR System - Render Build\n');

try {
  // Step 1: Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Install backend dependencies
  console.log('📦 Installing backend dependencies...');
  execSync('cd backend && npm install --production', { stdio: 'inherit' });
  
  // Step 3: Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  // Step 4: Ensure frontend public directory structure
  console.log('🔧 Setting up frontend public directory...');
  const frontendDir = path.join(__dirname, '..', 'frontend');
  const publicDir = path.join(frontendDir, 'public');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Created public directory');
  }
  
  // Ensure index.html exists
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('⚠️  Creating index.html...');
    const indexHtml = `<!DOCTYPE html>
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
    fs.writeFileSync(indexPath, indexHtml);
    console.log('✅ Created index.html');
  }
  
  // Ensure manifest.json exists
  const manifestPath = path.join(publicDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('⚠️  Creating manifest.json...');
    const manifest = {
      "short_name": "MOHR HR",
      "name": "MOHR HR Management System",
      "icons": [],
      "start_url": ".",
      "display": "standalone",
      "theme_color": "#3b82f6",
      "background_color": "#ffffff"
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Created manifest.json');
  }
  
  // Step 5: Build frontend
  console.log('🔨 Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  console.log('✅ Render build completed successfully!');
  console.log('🚀 Ready to start with: npm run start:backend');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 