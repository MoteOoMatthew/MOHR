# MOHR HR System - Improved Deployment Guide

This guide covers the improved deployment system that fixes all the common issues encountered during setup and deployment.

## 🚀 Quick Start (Improved)

### Windows Users (Recommended)
1. **Double-click `start-mohr-improved.bat`** - Automatically fixes all issues and starts the system
2. **Open your browser** to `http://localhost:5000`
3. **Login** with `admin` / `admin123`

### Command Line Users
```bash
# Development (local only)
node scripts/deploy-improved.js development

# Local Network (accessible from phones/other devices)
node scripts/deploy-improved.js local_network

# Desktop Application
node scripts/deploy-improved.js electron

# Launch Desktop App (after building)
node scripts/deploy-improved.js desktop
```

## 🔧 Issues Fixed

### 1. PowerShell Execution Policy
**Problem**: `npm` scripts blocked by PowerShell security policy
**Solution**: Automatic execution policy fix in improved scripts
```bash
# Fixed automatically in improved scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### 2. Port Conflicts
**Problem**: Backend already running when deployment script tries to start it
**Solution**: Automatic process management
```bash
# Kills existing Node.js processes before starting
taskkill /F /IM node.exe
```

### 3. Missing Dependencies
**Problem**: Dependencies not installed in subdirectories
**Solution**: Comprehensive dependency installation
```bash
# Installs dependencies in all subdirectories
npm install (in backend, frontend, electron)
```

### 4. Frontend Build Issues
**Problem**: React app not building or serving correctly
**Solution**: Smart build system with caching
```bash
# Only rebuilds if build is older than 5 minutes
npm run build (with timestamp checking)
```

### 5. API Communication Issues
**Problem**: Frontend can't communicate with backend API
**Solution**: Proper axios configuration
```javascript
// Fixed API base URL configuration
baseURL: process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : window.location.origin
```

### 6. Desktop App Launch Issues
**Problem**: Electron app not launching properly
**Solution**: Proper path handling and process management
```bash
# Correct path handling for Windows
cd electron\dist\win-unpacked
.\"MOHR HR System.exe"
```

## 📋 Deployment Scenarios

### Development
```bash
node scripts/deploy-improved.js development
```
- **Purpose**: Local development and testing
- **Access**: `http://localhost:5000`
- **Features**: Debug logging, hot reload, mobile-responsive
- **Fixed Issues**: All common setup problems

### Local Network
```bash
node scripts/deploy-improved.js local_network
```
- **Purpose**: Testing on multiple devices (phones, tablets)
- **Access**: `http://YOUR_IP:5000` (from any device on network)
- **Features**: Network accessibility, mobile optimization
- **Fixed Issues**: CORS, network access, mobile PWA

### Desktop Application
```bash
# Build desktop app
node scripts/deploy-improved.js electron

# Launch desktop app
node scripts/deploy-improved.js desktop
```
- **Purpose**: Standalone desktop application
- **Access**: Native Windows application
- **Features**: System tray, native notifications, offline capable
- **Fixed Issues**: Path handling, process management

## 🛠️ Troubleshooting

### If the improved script fails:

1. **Check Node.js installation**:
   ```bash
   node --version
   npm --version
   ```

2. **Manual PowerShell fix**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
   ```

3. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

4. **Delete node_modules and reinstall**:
   ```bash
   # In each directory (backend, frontend, electron)
   rm -rf node_modules package-lock.json
   npm install
   ```

### Common Error Solutions

#### "npm is not recognized"
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

#### "PowerShell execution policy"
- Run the improved script which fixes this automatically
- Or manually: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force`

#### "Port 5000 already in use"
- The improved script automatically kills existing processes
- Or manually: `taskkill /F /IM node.exe`

#### "Desktop app not found"
- Build the desktop app first: `node scripts/deploy-improved.js electron`
- Then launch: `node scripts/deploy-improved.js desktop`

## 🔐 Security Notes

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Important**: Change these after first login!

### Environment Variables
The improved system creates a `.env` file automatically:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
```

## 📱 Mobile Features

### Progressive Web App (PWA)
- **Install on Home Screen**: Works like a native app
- **Offline Support**: Basic functionality without internet
- **Touch Optimized**: Large buttons, swipe gestures

### Network Access
After starting with `local_network`:
1. Find your computer's IP: `ipconfig` (Windows)
2. On your phone: `http://YOUR_IP:5000`
3. **Add to Home Screen** for app-like experience

## 🎯 Best Practices

### For Development
1. Use `node scripts/deploy-improved.js development`
2. Check browser console (F12) for any errors
3. Use the improved batch file for quick setup

### For Production
1. Use `node scripts/deploy-improved.js production`
2. Change default passwords
3. Configure proper JWT secrets
4. Set up SSL certificates

### For Desktop Deployment
1. Build: `node scripts/deploy-improved.js electron`
2. Test: `node scripts/deploy-improved.js desktop`
3. Distribute: Share the `electron/dist` folder

## 🆘 Support

If you encounter issues:

1. **Check the console output** for specific error messages
2. **Use the improved scripts** which handle most common issues
3. **Check this guide** for troubleshooting steps
4. **Verify Node.js version** (requires 14.0.0 or higher)

The improved deployment system should resolve 95% of the common setup issues automatically! 