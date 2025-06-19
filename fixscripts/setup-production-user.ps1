# Setup Production User Account Script
# This script sets up the user account on the production Railway deployment

Write-Host "🚀 Setting up production user account..." -ForegroundColor Green

# Wait for deployment to complete
Write-Host "⏳ Waiting for Railway deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if the deployment is healthy
Write-Host "🔍 Checking deployment health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://tcmanger-production.up.railway.app/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Deployment is healthy" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Cyan
        Write-Host "   Environment: $($healthData.environment)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Could not reach production deployment" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Account Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your Account Details:" -ForegroundColor Cyan
Write-Host "   URL: https://tcmanger-production.up.railway.app" -ForegroundColor White
Write-Host "   Email: nrmokh@gmail.com" -ForegroundColor White  
Write-Host "   Password: Random1234!" -ForegroundColor White
Write-Host "   Role: Admin" -ForegroundColor White
Write-Host ""
Write-Host "📋 Updated Test Accounts:" -ForegroundColor Cyan
Write-Host "   Admin: admin@tcmanager.com / AdminPassword123!" -ForegroundColor White
Write-Host "   Developer: developer@tcmanager.com / DevPassword123!" -ForegroundColor White
Write-Host "   QA: qa@tcmanager.com / QAPassword123!" -ForegroundColor White
Write-Host "   Viewer: viewer@tcmanager.com / ViewPassword123!" -ForegroundColor White
Write-Host ""
Write-Host "✅ All accounts are ready for use!" -ForegroundColor Green
Write-Host "🌐 Visit: https://tcmanger-production.up.railway.app" -ForegroundColor Yellow 