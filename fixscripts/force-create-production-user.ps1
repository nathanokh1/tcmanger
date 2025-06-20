#!/usr/bin/env pwsh

Write-Host "Force Creating Production User via API" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$productionUrl = "https://tcmanager-production.up.railway.app"

# Test user data
$userData = @{
    firstName = "Admin"
    lastName = "User"
    email = "admin@tcmanager.com"
    password = "admin123!"
    role = "admin"
    tenantId = "production"
} | ConvertTo-Json

Write-Host "Creating admin user in production..." -ForegroundColor Yellow
Write-Host "URL: $productionUrl/api/auth/register" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$productionUrl/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
    
    Write-Host "✅ User created successfully!" -ForegroundColor Green
    Write-Host "Login with: admin@tcmanager.com / admin123!" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error creating user:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Try logging in at: $productionUrl/login" -ForegroundColor Cyan 