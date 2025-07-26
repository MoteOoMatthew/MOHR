#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🏗️  MOHR HR System - Simple Build\n');

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🔨 Building frontend...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  
  console.log('✅ Simple build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 