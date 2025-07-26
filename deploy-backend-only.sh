#!/bin/bash

echo "🚀 MOHR HR System - Backend Only Deployment"

# Install only backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production
cd ..

echo "✅ Backend deployment ready!"
echo "🚀 Starting backend server..."
cd backend && node server.js 