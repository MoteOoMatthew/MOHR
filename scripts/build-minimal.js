#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🏗️  MOHR HR System - Minimal Build\n');

try {
  // Step 1: Simple npm install
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Direct frontend build without workspace
  console.log('🔨 Building frontend directly...');
  process.chdir('frontend');
  execSync('npm install', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  process.chdir('..');
  
  // Step 3: Install backend dependencies
  console.log('📦 Installing backend dependencies...');
  process.chdir('backend');
  execSync('npm install --production', { stdio: 'inherit' });
  process.chdir('..');
  
  console.log('✅ Minimal build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 