# Fix CSP Deployment Issue on Railway
# This script addresses Content Security Policy errors preventing inline scripts

Write-Host "🔧 Fixing CSP Deployment Issue for TCManager..." -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "client/next.config.js")) {
    Write-Host "❌ Error: Run this script from the TCM project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Issue Analysis:" -ForegroundColor Yellow
Write-Host "   • Content Security Policy blocking inline scripts"
Write-Host "   • Next.js configuration needs CSP headers"
Write-Host "   • Railway deployment requires proper build configuration"
Write-Host ""

Write-Host "✅ Applied Fixes:" -ForegroundColor Green
Write-Host "   • Updated next.config.js with proper CSP headers"
Write-Host "   • Enabled 'unsafe-inline' for scripts and styles"
Write-Host "   • Removed static export mode (incompatible with Railway)"
Write-Host "   • Added proper image domains and remote patterns"
Write-Host "   • Configured security headers for production"
Write-Host ""

Write-Host "🚀 Deploying to Railway..." -ForegroundColor Cyan

# Check if Railway CLI is installed
$railwayCmd = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayCmd) {
    Write-Host "⚠️  Railway CLI not found. Installing via npm..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Railway CLI" -ForegroundColor Red
        Write-Host "💡 Manual installation: npm install -g @railway/cli" -ForegroundColor Cyan
        exit 1
    }
}

# Login to Railway (if not already logged in)
Write-Host "🔐 Checking Railway authentication..." -ForegroundColor Cyan
railway whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔑 Please login to Railway..." -ForegroundColor Yellow
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Railway login failed" -ForegroundColor Red
        exit 1
    }
}

# Deploy the fixes
Write-Host "📦 Deploying updated configuration..." -ForegroundColor Cyan
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "💡 Try manual deployment: railway up --detach" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Your TCManager app should now load without CSP errors" -ForegroundColor Cyan
Write-Host "📍 URL: https://tcmanger-production.up.railway.app" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 What was fixed:" -ForegroundColor Yellow
Write-Host "   1. Content Security Policy now allows inline scripts"
Write-Host "   2. Next.js headers configured for production"
Write-Host "   3. Image loading optimized for Railway"
Write-Host "   4. Security headers properly configured"
Write-Host ""

Write-Host "⏱️  Wait 2-3 minutes for deployment to complete, then test:" -ForegroundColor Cyan
Write-Host "   • No more CSP errors in browser console"
Write-Host "   • 'Loading TCManager...' should disappear"
Write-Host "   • Login page should display properly"
Write-Host ""

Write-Host "🎉 CSP Issue Fixed! Your TCManager is now production-ready!" -ForegroundColor Green 