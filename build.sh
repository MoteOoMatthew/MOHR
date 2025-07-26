#!/bin/bash

echo "🏗️  MOHR HR System - Shell Build Script"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production
cd ..

echo "✅ Build completed successfully!" 