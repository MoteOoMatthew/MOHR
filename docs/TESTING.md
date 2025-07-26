# MOHR HR System - Testing Guide

## 🧪 Overview

This guide covers testing the MOHR HR System to ensure it works reliably across different environments and clean installations.

## 🚀 Quick Test

### Automated Clean Installation Test
```bash
# Run the comprehensive test suite
npm test

# Or run directly
node scripts/test-clean-install.js
```

This will test:
- ✅ Prerequisites (Node.js, npm)
- ✅ Clean dependency installation
- ✅ Frontend build process
- ✅ Database initialization
- ✅ Server functionality
- ✅ Deployment scenarios
- ✅ Mobile responsiveness

## 📋 Manual Testing Checklist

### 1. Prerequisites Check
- [ ] Node.js version >= 14.0.0
- [ ] npm version >= 6.0.0
- [ ] Port 5000 available
- [ ] Sufficient disk space (at least 500MB)

### 2. Clean Installation Test
```bash
# Remove existing installations
rm -rf node_modules backend/node_modules frontend/node_modules electron/node_modules

# Install all dependencies
npm run install-all

# Verify installations
ls -la node_modules
ls -la backend/node_modules
ls -la frontend/node_modules
ls -la electron/node_modules
```

### 3. Build Test
```bash
# Build frontend
npm run build

# Verify build output
ls -la frontend/build/
```

### 4. Database Test
```bash
# Remove existing database
rm -f backend/mohr.db

# Start server (will create database)
cd backend && npm start

# In another terminal, test database
curl http://localhost:5000/api/health
```

### 5. Server Functionality Test
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test frontend serving
curl http://localhost:5000/

# Test API endpoints
curl http://localhost:5000/api/auth/login
```

### 6. Deployment Scenarios Test
```bash
# Test each deployment scenario
node scripts/deploy.js development
node scripts/deploy.js local_network
node scripts/deploy.js production
node scripts/deploy.js remote
node scripts/deploy.js electron
```

### 7. Mobile Responsiveness Test
- [ ] Open browser dev tools
- [ ] Set device to mobile (e.g., iPhone 12)
- [ ] Verify responsive layout
- [ ] Test touch interactions
- [ ] Check PWA manifest
- [ ] Test "Add to Home Screen"

## 🌍 Environment-Specific Testing

### Windows Testing
```bash
# Use Command Prompt (not PowerShell)
cmd /c "npm test"

# Test Windows batch file
start-mohr.bat
```

### macOS Testing
```bash
# Test on macOS
npm test

# Test Electron build
cd electron && npm run dist-mac
```

### Linux Testing
```bash
# Test on Linux
npm test

# Test Electron build
cd electron && npm run dist-linux
```

## 📱 Mobile Testing

### Network Access Test
1. **Start with network deployment:**
   ```bash
   node scripts/deploy.js local_network
   ```

2. **Find your IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

3. **Test from mobile device:**
   - Open browser on phone
   - Go to: `http://YOUR_IP:5000`
   - Verify the app loads
   - Test login functionality
   - Test responsive design

### PWA Testing
1. **Add to Home Screen:**
   - On mobile browser, tap "Add to Home Screen"
   - Verify app icon appears
   - Test launching from home screen

2. **Offline Functionality:**
   - Disconnect from WiFi
   - Verify basic functionality still works
   - Reconnect and test sync

## 🔧 Troubleshooting Tests

### Common Test Failures

**Port Already in Use:**
```bash
# Find process using port
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process_id> /F
```

**Dependency Installation Fails:**
```bash
# Clear npm cache
npm cache clean --force

# Try with different npm version
npm install --legacy-peer-deps
```

**Build Fails:**
```bash
# Clear build cache
cd frontend && rm -rf build node_modules
npm install
npm run build
```

**Database Issues:**
```bash
# Remove and recreate database
rm -f backend/mohr.db
cd backend && npm start
```

### Test Environment Setup

**Clean Machine Simulation:**
```bash
# Create test environment
mkdir test-mohr
cd test-mohr

# Clone or copy project files
cp -r ../MOHR/* .

# Run tests
npm test
```

**Docker Testing (Optional):**
```dockerfile
# Dockerfile for testing
FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm run install-all
RUN npm test
```

## 📊 Test Results Interpretation

### Success Indicators
- ✅ All dependencies install without errors
- ✅ Frontend builds successfully
- ✅ Database initializes with tables
- ✅ Server starts and responds to requests
- ✅ Health endpoint returns 200
- ✅ Frontend loads in browser
- ✅ Mobile responsive design works
- ✅ PWA manifest is valid

### Warning Signs
- ⚠️ npm warnings (usually safe to ignore)
- ⚠️ Port conflicts (may need to change port)
- ⚠️ Missing optional dependencies
- ⚠️ Build warnings (check for critical issues)

### Failure Indicators
- ❌ Node.js version too old
- ❌ Dependency installation fails
- ❌ Build process fails
- ❌ Server won't start
- ❌ Database initialization fails
- ❌ API endpoints don't respond
- ❌ Frontend doesn't load

## 🔄 Continuous Testing

### Pre-commit Tests
```bash
# Run tests before committing
npm test

# Run specific test
node scripts/test-clean-install.js
```

### Automated Testing (Future)
- GitHub Actions workflow
- Automated deployment testing
- Performance testing
- Security testing

## 📝 Test Documentation

### Test Reports
After running tests, document:
- Test environment (OS, Node.js version)
- Test results (pass/fail)
- Any issues encountered
- Performance metrics
- Recommendations

### Bug Reports
When reporting issues, include:
- Test environment details
- Steps to reproduce
- Error messages
- Expected vs actual behavior
- Screenshots (if applicable)

---

**Note:** Regular testing ensures the system works reliably across different environments and helps catch issues early in development. 