# Railway Deployment Script for TCManager
# Run this script to deploy to Railway using CLI

Write-Host "🚂 TCManager Railway Deployment Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    railway --version
    Write-Host "✅ Railway CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "📝 Logging into Railway..." -ForegroundColor Yellow
railway login

# Create new project
Write-Host "🆕 Creating Railway project..." -ForegroundColor Yellow
railway init

# Set environment variables
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow
Write-Host "Please provide the following information:"

$mongoUri = Read-Host "Enter your MongoDB Atlas connection string"
$jwtSecret = Read-Host "Enter a secure JWT secret (min 32 characters)"

# Set the environment variables
railway variables set MONGODB_URI="$mongoUri"
railway variables set JWT_SECRET="$jwtSecret"
railway variables set NODE_ENV="production"

Write-Host "📦 Deploying to Railway..." -ForegroundColor Yellow
railway up

Write-Host "🎉 Deployment initiated!" -ForegroundColor Green
Write-Host "Check your Railway dashboard for deployment status" -ForegroundColor Yellow

# Show project info
railway status 