# MOHR HR System - Quick Deployment Reference

## URLs
- GitHub Repository: https://github.com/MoteOoMatthew/MOHR.git
- Railway Dashboard: https://railway.app
- Vercel Dashboard: https://vercel.com

## Environment Variables

### Railway (Backend)
NODE_ENV=production
JWT_SECRET=e93e46684f6f03f166c09e6875ea970e4f24e83f2d2566fe5457b1d7b779ba156be51da4da4d57865e7907934a83d87a9140d47a227da29b231f4c280b8feeaf
HOST=0.0.0.0
DB_TYPE=postgres
DATABASE_URL=postgresql://... (Railway provides)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

### Vercel (Frontend)
REACT_APP_API_URL=https://your-backend-domain.railway.app

## Build Commands

### Railway
Build: npm install && npm run build:frontend
Start: npm run start:backend

### Vercel
Build: npm run build
Root Directory: frontend
Output Directory: build

## Default Login
Username: admin
Password: admin123
