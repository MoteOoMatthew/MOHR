#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🏗️  MOHR HR System - Production Build\n');

try {
  console.log('📦 Installing backend dependencies...');
  execSync('cd backend && npm install --production', { stdio: 'inherit' });
  
  console.log('📦 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log('🔨 Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  console.log('✅ Production build completed successfully!');
  console.log('🚀 Ready to start with: npm run start:backend');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 