#!/bin/bash
echo "🚀 Deploying to DigitalOcean App Platform..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl CLI not found. Please install it first:"
    echo "   https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if do-app.yaml exists
if [ ! -f "do-app.yaml" ]; then
    echo "❌ do-app.yaml not found. Please create it first."
    echo "   See DEPLOYMENT-REMOTE.md for details."
    exit 1
fi

# Deploy to DigitalOcean
echo "📤 Deploying to DigitalOcean..."
doctl apps create --spec do-app.yaml

echo "✅ Deployment initiated!"
echo "Check your DigitalOcean dashboard for status."
