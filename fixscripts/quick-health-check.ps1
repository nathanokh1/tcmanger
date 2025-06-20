#!/usr/bin/env pwsh

Write-Host "Quick Health Check for Railway" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

$baseUrl = "https://tcmanager-production.up.railway.app"

Write-Host "Checking health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "Environment: $($response.environment)" -ForegroundColor Cyan
    Write-Host "Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor Cyan
    
    if ($response.realtime) {
        Write-Host "Real-time enabled: $($response.realtime.enabled)" -ForegroundColor Cyan
    }
    
    if ($response.cache) {
        Write-Host "Cache enabled: $($response.cache.enabled)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Health check failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "If health check passes, let's test a simple auth endpoint..." -ForegroundColor Yellow

try {
    # Try to hit the login endpoint with invalid data just to see if it responds
    $testData = @{ email = "test"; password = "test" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Auth endpoint responded (even if login failed)" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 401) {
        Write-Host "✅ Auth endpoint exists! (Got $statusCode which means it's working)" -ForegroundColor Green
    } else {
        Write-Host "❌ Auth endpoint issue: $statusCode" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} 