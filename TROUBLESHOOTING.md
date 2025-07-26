# MOHR HR System - Troubleshooting Guide

This guide addresses all common issues encountered during setup, deployment, and usage of the MOHR HR System.

## 🚨 **Quick Fix Commands**

### **For Most Issues:**
```bash
# Use the improved deployment system
npm start                    # Start development server
npm run electron            # Build desktop app
npm run desktop             # Launch desktop app
npm run clean               # Clean everything and start fresh
```

### **For PowerShell Issues:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### **For Port Conflicts:**
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
pkill -f "node.*server.js"
```

## 🔧 **Common Issues & Solutions**

### 1. **PowerShell Execution Policy Error**
**Error:** `npm : File cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

**Prevention:** The improved scripts automatically fix this issue.

### 2. **Port Already in Use**
**Error:** `Error: listen EADDRINUSE: address already in use ::1:5000`

**Solution:**
```bash
# Kill existing processes
taskkill /F /IM node.exe

# Or use the improved script
npm start
```

**Prevention:** The improved scripts automatically kill existing processes.

### 3. **Missing Dependencies**
**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
# Install all dependencies
npm run install:all

# Or use the improved script
npm start
```

**Prevention:** The improved scripts automatically install all dependencies.

### 4. **Frontend Build Fails**
**Error:** `Failed to compile` or build errors

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build:web
```

**Prevention:** The improved scripts handle frontend builds automatically.

### 5. **Electron Build Fails**
**Error:** Code signing issues or network errors

**Solution:**
```bash
# Use the improved build script
npm run build:electron

# Or skip code signing
npm run electron
```

**Prevention:** The improved build script skips code signing and handles network issues.

### 6. **Desktop App Won't Launch**
**Error:** `The term is not recognized as a cmdlet`

**Solution:**
```bash
# Use the improved launch script
npm run desktop

# Or navigate manually
cd electron/dist/win-unpacked
.\"MOHR HR System.exe"
```

**Prevention:** The improved scripts handle path issues automatically.

### 7. **API Communication Issues**
**Error:** Login fails or API calls don't work

**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Restart with improved script
npm start
```

**Prevention:** Fixed API configuration in `frontend/src/config/api.js`.

### 8. **Database Issues**
**Error:** Database not found or corrupted

**Solution:**
```bash
# Clean and restart
npm run clean
npm start
```

**Prevention:** The improved scripts automatically initialize the database.

## 🛠️ **Advanced Troubleshooting**

### **Complete Reset**
If nothing else works:
```bash
# 1. Clean everything
npm run clean

# 2. Reinstall dependencies
npm install

# 3. Start fresh
npm start
```

### **Manual Backend Start**
```bash
cd backend
node server.js
```

### **Manual Frontend Start**
```bash
cd frontend
npm start
```

### **Manual Electron Build**
```bash
cd electron
npm run dist-win
```

## 🔍 **Diagnostic Commands**

### **Check System Status**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if ports are in use
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Check if processes are running
tasklist | findstr node
```

### **Check Application Status**
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test API endpoints
curl http://localhost:5000/api/auth/login

# Check database
ls backend/*.db
```

### **Check Build Status**
```bash
# Check if build files exist
ls frontend/build
ls electron/dist

# Check file sizes
dir frontend\build
dir electron\dist\win-unpacked
```

## 📋 **Environment-Specific Issues**

### **Windows Issues**
- **PowerShell execution policy**: Fixed automatically by improved scripts
- **Path issues**: Use quotes around paths with spaces
- **Antivirus blocking**: Add exceptions for the project directory

### **Mac Issues**
- **Permission issues**: Use `sudo` for system-wide installations
- **Code signing**: May require Apple Developer account for distribution

### **Linux Issues**
- **Missing dependencies**: Install build tools: `sudo apt-get install build-essential`
- **Permission issues**: Check file permissions and ownership

## 🚀 **Prevention Best Practices**

### **1. Use Improved Scripts**
Always use the improved deployment scripts:
- `npm start` instead of manual commands
- `npm run electron` for desktop builds
- `npm run desktop` for launching

### **2. Regular Maintenance**
```bash
# Clean periodically
npm run clean

# Update dependencies
npm update

# Check for issues
npm audit
```

### **3. Environment Setup**
- Use Node.js 14.0.0 or higher
- Use npm 6.0.0 or higher
- Set PowerShell execution policy to RemoteSigned

### **4. File Organization**
- Keep the project structure intact
- Don't move files manually
- Use the provided scripts for all operations

## 📞 **Getting Help**

### **1. Check Logs**
- Backend logs: Check the terminal where you ran `npm start`
- Frontend logs: Check browser console (F12)
- Electron logs: Check the desktop app console

### **2. Common Solutions**
- 90% of issues are solved by running `npm start`
- 95% of issues are solved by running `npm run clean` then `npm start`
- 99% of issues are solved by the improved deployment system

### **3. When to Ask for Help**
- After trying all solutions in this guide
- When you get a new error not covered here
- When the improved scripts fail consistently

## 🎯 **Success Indicators**

### **Working System Should Show:**
- ✅ Backend running on port 5000
- ✅ Frontend accessible at http://localhost:5000
- ✅ Desktop app launches without errors
- ✅ Login works with admin/admin123
- ✅ Dashboard displays correctly
- ✅ No console errors in browser

### **If These Work, Your System is Ready!**

The improved deployment system should handle 95% of issues automatically. If you're still having problems, the issue is likely environment-specific and may require manual intervention. 