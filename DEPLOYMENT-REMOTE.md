# 🌐 Remote Deployment Guide - MOHR HR System

## 🎯 Quick Start: Vercel + Railway (Recommended)

This is the easiest way to deploy your MOHR HR System to the cloud.

### **Step 1: Prepare Your Repository**

1. **Push to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mohr-hr-system.git
   git push -u origin main
   ```

2. **Update package.json for production**
   ```json
   {
     "scripts": {
       "build:frontend": "cd frontend && npm run build",
       "start:backend": "cd backend && npm start"
     }
   }
   ```

### **Step 2: Deploy Backend to Railway**

1. **Go to [Railway.app](https://railway.app)**
2. **Connect your GitHub account**
3. **Create new project → Deploy from GitHub repo**
4. **Select your repository**
5. **Configure environment variables:**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secure-jwt-secret-here
   HOST=0.0.0.0
   DB_TYPE=postgres
   DATABASE_URL=postgresql://... (Railway will provide this)
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

6. **Set build command:**
   ```bash
   npm install && npm run build:frontend
   ```

7. **Set start command:**
   ```bash
   npm run start:backend
   ```

### **Step 3: Deploy Frontend to Vercel**

1. **Go to [Vercel.com](https://vercel.com)**
2. **Connect your GitHub account**
3. **Import your repository**
4. **Configure build settings:**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Add environment variables:**
   ```
   REACT_APP_API_URL=https://your-backend-domain.railway.app
   ```

### **Step 4: Update API Configuration**

Update `frontend/src/config/api.js`:
```javascript
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};
```

## 🚀 Alternative: DigitalOcean App Platform

### **Step 1: Prepare for DigitalOcean**

1. **Create `do-app.yaml` in root:**
```yaml
name: mohr-hr-system
services:
- name: backend
  source_dir: /backend
  github:
    repo: yourusername/mohr-hr-system
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-super-secure-jwt-secret
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}

- name: frontend
  source_dir: /frontend
  github:
    repo: yourusername/mohr-hr-system
    branch: main
  run_command: npm run build && npx serve -s build -l 3000
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: REACT_APP_API_URL
    value: https://backend-${app.name}.ondigitalocean.app

databases:
- name: db
  engine: PG
  version: "12"
```

### **Step 2: Deploy to DigitalOcean**

1. **Install doctl CLI**
2. **Authenticate with DigitalOcean**
3. **Deploy:**
   ```bash
   doctl apps create --spec do-app.yaml
   ```

## 🏠 Self-Hosted VPS Setup

### **Step 1: Server Setup (Ubuntu 20.04)**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### **Step 2: Database Setup**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE mohr_db;
CREATE USER mohr_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mohr_db TO mohr_user;
\q
```

### **Step 3: Application Setup**

```bash
# Clone repository
git clone https://github.com/yourusername/mohr-hr-system.git
cd mohr-hr-system

# Install dependencies
npm run install:all

# Build frontend
npm run build:frontend

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret
HOST=0.0.0.0
DB_TYPE=postgres
DATABASE_URL=postgresql://mohr_user:your_secure_password@localhost:5432/mohr_db
CORS_ORIGIN=https://your-domain.com
EOF

# Start with PM2
pm2 start backend/server.js --name "mohr-backend"
pm2 startup
pm2 save
```

### **Step 4: Nginx Configuration**

```bash
sudo nano /etc/nginx/sites-available/mohr
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/ubuntu/mohr-hr-system/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mohr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 5: SSL with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 🔒 Security Checklist

### **Essential Security Measures:**

1. **Change Default Passwords**
   - Update admin password
   - Use strong JWT secret
   - Secure database passwords

2. **Environment Variables**
   - Never commit `.env` files
   - Use different secrets for each environment
   - Rotate secrets regularly

3. **Database Security**
   - Use strong passwords
   - Limit database access
   - Regular backups
   - Enable SSL connections

4. **Application Security**
   - Enable CORS properly
   - Rate limiting
   - Input validation
   - SQL injection prevention

5. **Server Security**
   - Firewall configuration
   - SSH key authentication
   - Regular updates
   - Monitoring and logging

## 📊 Cost Comparison

| Platform | Monthly Cost | Setup Time | Maintenance | Best For |
|----------|-------------|------------|-------------|----------|
| Vercel + Railway | $10-20 | 30 min | Low | Small teams |
| DigitalOcean | $25-50 | 1 hour | Medium | Growing businesses |
| AWS/GCP/Azure | $100-500+ | 1 day | High | Enterprise |
| VPS | $5-20 | 2 hours | High | Tech-savvy users |

## 🚀 Quick Deployment Commands

### **Railway + Vercel (Recommended)**
```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy backend to Railway
# (Use Railway dashboard)

# 3. Deploy frontend to Vercel
# (Use Vercel dashboard)

# 4. Update environment variables
# (In both platforms)
```

### **DigitalOcean**
```bash
# Deploy with one command
doctl apps create --spec do-app.yaml
```

### **VPS**
```bash
# Run deployment script
curl -sSL https://raw.githubusercontent.com/yourusername/mohr-hr-system/main/scripts/deploy-vps.sh | bash
```

## 🆘 Troubleshooting

### **Common Issues:**

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend URL is correct

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database is accessible

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors

4. **Performance Issues**
   - Enable gzip compression
   - Use CDN for static assets
   - Optimize database queries
   - Enable caching

## 📞 Support

For deployment issues:
1. Check the logs in your hosting platform
2. Verify environment variables
3. Test locally first
4. Check the troubleshooting guide

---

**🎉 Your MOHR HR System is now ready for production deployment!** 