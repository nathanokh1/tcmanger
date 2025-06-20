#!/usr/bin/env pwsh

Write-Host "Creating Production Test User" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

$baseUrl = "https://tcmanager-production.up.railway.app"

# Test users to create
$users = @(
    @{
        firstName = "Admin"
        lastName = "User"
        email = "admin@tcmanager.com" 
        password = "Admin123!"
        role = "admin"
        tenantId = "production"
    },
    @{
        firstName = "Demo"
        lastName = "User"
        email = "demo@tcmanager.com"
        password = "demo123"
        role = "qa"
        tenantId = "production"
    }
)

foreach ($user in $users) {
    Write-Host "Creating user: $($user.email)" -ForegroundColor Yellow
    
    try {
        $userData = $user | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
        
        Write-Host "✅ User created: $($user.email)" -ForegroundColor Green
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 409) {
            Write-Host "⚠️  User already exists: $($user.email)" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Error creating user $($user.email): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🎯 Test Login Credentials:" -ForegroundColor Cyan
Write-Host "Admin: admin@tcmanager.com / Admin123!" -ForegroundColor Yellow
Write-Host "Demo:  demo@tcmanager.com / demo123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Go to: $baseUrl/login" -ForegroundColor Green 