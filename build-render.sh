#!/bin/bash

echo "🏗️  MOHR HR System - Render Build Script"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Ensure frontend public directory exists
echo "🔧 Setting up frontend public directory..."
mkdir -p frontend/public

# Create index.html if it doesn't exist
echo "📋 Creating index.html..."
cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
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
</html>
EOF

# Install and build frontend
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