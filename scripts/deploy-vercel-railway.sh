#!/bin/bash
echo "🚀 Deploying to Vercel + Railway..."

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://railway.app and create a new project"
echo "2. Connect your GitHub repository"
echo "3. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET=your-secure-secret"
echo "   - DATABASE_URL=postgresql://... (Railway will provide)"
echo "   - CORS_ORIGIN=https://your-frontend-domain.vercel.app"
echo "4. Set build command: npm install && npm run build:frontend"
echo "5. Set start command: npm run start:backend"
echo ""
echo "6. Go to https://vercel.com and import your repository"
echo "7. Set root directory to 'frontend'"
echo "8. Add environment variable: REACT_APP_API_URL=https://your-backend-domain.railway.app"
echo ""
echo "🎉 Your app will be deployed automatically!"
