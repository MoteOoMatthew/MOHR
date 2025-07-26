# 🚀 Render Deployment Guide - MOHR HR System

## 📋 Prerequisites

1. **GitHub Repository**: Your MOHR HR System must be pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Clean Git Repository**: No uncommitted changes

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Select your MOHR HR System repository**

### Step 3: Configure the Web Service

Use these exact settings:

- **Name**: `mohr-hr-system`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (uses root)
- **Build Command**: `npm install && npm run build:frontend`
- **Start Command**: `npm run start:backend`

### Step 4: Environment Variables

Add these environment variables in Render:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `5000` | Server port |
| `HOST` | `0.0.0.0` | Allow external connections |
| `JWT_SECRET` | `your-super-secure-secret-here` | JWT signing secret |
| `DB_TYPE` | `sqlite` | Database type |
| `CORS_ORIGIN` | `*` | Allow all origins |

### Step 5: Instance Type

- **Free Tier**: For testing and small deployments
- **Paid Plans**: For production use with better performance

### Step 6: Deploy

Click **"Create Web Service"** and wait for deployment to complete.

## 🌐 Access Your Application

Once deployed, Render will provide you with:
- **URL**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/api/health`

## 🔐 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📊 Monitoring

- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory usage
- **Health Checks**: Automatic monitoring

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

2. **App Won't Start**
   - Verify start command: `npm run start:backend`
   - Check environment variables

3. **Database Issues**
   - SQLite database is created automatically
   - Ensure write permissions

4. **CORS Errors**
   - Set `CORS_ORIGIN` to `*` or your domain

### Useful Commands:

```bash
# Check deployment status
curl https://your-app-name.onrender.com/api/health

# View logs (in Render dashboard)
# Go to your service → Logs tab
```

## 🔄 Updating Your Deployment

1. **Push changes to GitHub**
2. **Render automatically redeploys**
3. **Monitor deployment in dashboard**

## 💰 Cost Optimization

- **Free Tier**: $0/month (with limitations)
- **Paid Plans**: Start at $7/month
- **Auto-sleep**: Free instances sleep after inactivity

## 🛡️ Security Considerations

1. **Change default admin password** after first login
2. **Use strong JWT_SECRET**
3. **Enable HTTPS** (automatic with Render)
4. **Regular updates** of dependencies

## 📞 Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **MOHR Issues**: GitHub repository issues
- **Community**: Render Discord/forums

---

**🎉 Congratulations!** Your MOHR HR System is now deployed and accessible worldwide! 