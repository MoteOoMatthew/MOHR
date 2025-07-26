# MOHR HR System - Deployment Guide

This guide covers deploying the MOHR HR System in various environments and scenarios.

## 🚀 Quick Start

### Windows Users (Easiest)
1. Double-click `start-mohr.bat`
2. Wait for the system to start
3. Open your browser to `http://localhost:5000`
4. Login with `admin` / `admin123`

### Command Line Users
```bash
# Install dependencies and start
node scripts/deploy.js development

# Or for network access
node scripts/deploy.js local_network
```

## 🌍 Deployment Scenarios

### 1. Local Development
**Use case:** Personal development and testing
```bash
node scripts/deploy.js development
```
- **Access:** `http://localhost:5000`
- **Features:** Debug logging, hot reload, mobile-responsive
- **Security:** Basic

### 2. Local Network
**Use case:** Small office, multiple computers on same network, mobile access
```bash
node scripts/deploy.js local_network
```
- **Access:** `http://YOUR_IP:5000` (from any device on network)
- **Features:** Network accessible, shared database, mobile PWA
- **Security:** Network-level security

### 3. Production (Single Server)
**Use case:** Small to medium business
```bash
node scripts/deploy.js production
```
- **Access:** `http://your-domain.com`
- **Features:** Optimized performance, file logging, mobile PWA
- **Security:** Enhanced security, rate limiting

### 4. Remote/Cloud Deployment
**Use case:** Large organization, multiple locations
```bash
node scripts/deploy.js remote
```
- **Access:** `https://your-domain.com`
- **Features:** Cloud database, SSL, load balancing, mobile PWA
- **Security:** Maximum security, monitoring

### 5. Desktop Application (Electron)
**Use case:** Single computer, no network required
```bash
node scripts/deploy.js electron
```
- **Access:** Desktop application
- **Features:** Self-contained, offline capable
- **Security:** Local only

## 🔧 Environment Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
SERVER_HOST=0.0.0.0

# Database Configuration
DB_TYPE=sqlite
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mohr_hr
DB_USER=postgres
DB_PASS=your_password

# Security
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=24h

# CORS (for remote access)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=warn
```

### Custom Configuration
Create `config/custom.js` for environment-specific settings:

```javascript
module.exports = {
  server: {
    port: 8080,
    host: '0.0.0.0'
  },
  database: {
    type: 'postgresql',
    postgresql: {
      host: 'localhost',
      port: 5432,
      database: 'mohr_hr',
      username: 'postgres',
      password: 'your_password'
    }
  }
};
```

## 🗄️ Database Options

### SQLite (Default - Recommended for small deployments)
- **Pros:** No setup required, file-based, portable
- **Cons:** Limited concurrent users, no network access
- **Best for:** Single user, small office, development

### PostgreSQL (Recommended for production)
```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/

# Create database
createdb mohr_hr
```

### MySQL
```bash
# Install MySQL
# Ubuntu/Debian
sudo apt-get install mysql-server

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

## 🔒 Security Considerations

### For Local Network
- Configure firewall to allow port 5000
- Use strong passwords
- Regular backups

### For Internet Access
- **SSL Certificate:** Required for HTTPS
- **Domain:** Configure DNS properly
- **Firewall:** Only allow necessary ports
- **Rate Limiting:** Enabled by default
- **JWT Secret:** Change from default

### SSL Setup (for production)
```bash
# Using Let's Encrypt (free)
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Configure in your web server (nginx/apache)
```

## 📦 Building Distributable Packages

### Windows Installer
```bash
cd electron
npm run dist-win
```
Creates: `electron/dist/MOHR HR System Setup.exe`

### macOS App
```bash
cd electron
npm run dist-mac
```
Creates: `electron/dist/MOHR HR System.dmg`

### Linux AppImage
```bash
cd electron
npm run dist-linux
```
Creates: `electron/dist/MOHR HR System.AppImage`

## 🚀 Deployment Scripts

### Automated Deployment
```bash
# Development
node scripts/deploy.js development

# Local Network
node scripts/deploy.js local_network

# Production
node scripts/deploy.js production

# Remote Server
node scripts/deploy.js remote

# Electron App
node scripts/deploy.js electron
```

### Manual Deployment
```bash
# 1. Install dependencies
npm install

# 2. Build frontend
cd frontend && npm install && npm run build

# 3. Start server
cd ../backend && NODE_ENV=production npm start
```

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process_id> /F
```

**Database connection errors:**
- Check database is running
- Verify connection settings
- Ensure database exists

**CORS errors:**
- Check `ALLOWED_ORIGINS` in environment
- Verify frontend URL is included

**Permission errors:**
- Run as administrator (Windows)
- Check file permissions (Linux/Mac)

### Logs
- **Development:** Console output
- **Production:** `logs/app.log`
- **Electron:** Application logs in system

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check server status
curl http://localhost:5000/api/health

# Check database
curl http://localhost:5000/api/health/database
```

### Backups
```bash
# SQLite backup
cp backend/mohr.db backup/mohr_$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump mohr_hr > backup/mohr_$(date +%Y%m%d).sql
```

### Updates
```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Restart server
npm restart
```

## 📱 Mobile Deployment & PWA

### Progressive Web App (PWA) Features
- **Install on Home Screen**: Users can add the app to their phone's home screen
- **Offline Support**: Basic functionality works without internet
- **Touch Optimized**: Large buttons and swipe gestures
- **Fast Loading**: Optimized for mobile networks

### Mobile Access Setup
1. **Start with network deployment:**
   ```bash
   node scripts/deploy.js local_network
   ```

2. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

3. **Access from mobile device:**
   - Open browser on your phone
   - Go to: `http://YOUR_IP:5000`
   - Tap "Add to Home Screen" for app-like experience

### Mobile Testing
- **Test on actual devices**: Browser dev tools aren't enough
- **Check touch targets**: Minimum 44px for easy tapping
- **Verify network access**: Ensure both devices on same WiFi
- **Test PWA installation**: Add to home screen functionality

## 🌐 Network Configuration

### Finding Your IP Address
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
# or
ip addr show
```

### Firewall Configuration
```bash
# Windows (PowerShell as Administrator)
New-NetFirewallRule -DisplayName "MOHR HR System" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow

# Linux
sudo ufw allow 5000

# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/node
```

## 📞 Support

For deployment issues:
1. Check the logs
2. Verify environment configuration
3. Test with default settings first
4. Check network connectivity
5. Review security settings

---

**MOHR HR System** - Making deployment simple and flexible! 🎉 