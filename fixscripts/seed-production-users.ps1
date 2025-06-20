#!/usr/bin/env pwsh

Write-Host "Seeding Production Users for Railway Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Set production environment variables
$env:NODE_ENV = "production"
$env:MONGODB_URI = "mongodb+srv://your-production-connection-string"
$env:CREATE_TEST_USERS = "true"
$env:DEFAULT_TENANT = "prod"

# Navigate to server directory
Set-Location "../server"

Write-Host "Creating production test users..." -ForegroundColor Yellow

try {
    # Run the seed users script
    & npm run seed:users
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production users created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now login with these credentials:" -ForegroundColor Cyan
        Write-Host "Admin: admin@tcmanager.com / admin123!" -ForegroundColor Yellow
        Write-Host "QA: qa@tcmanager.com / qa123!" -ForegroundColor Yellow  
        Write-Host "Dev: dev@tcmanager.com / dev123!" -ForegroundColor Yellow
        Write-Host "Demo: demo@tcmanager.com / demo123" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to create users" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} 