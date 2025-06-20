#!/usr/bin/env pwsh

Write-Host "Testing Railway Production Endpoints" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

$baseUrl = "https://tcmanager-production.up.railway.app"

# Test endpoints
$endpoints = @(
    "/health",
    "/api/auth/register", 
    "/api/auth/login",
    "/api/projects",
    "/api/users"
)

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$endpoint"
    Write-Host "Testing: $url" -ForegroundColor Yellow
    
    try {
        if ($endpoint -eq "/api/auth/register" -or $endpoint -eq "/api/auth/login") {
            # Test POST endpoint with minimal data
            $testData = @{ email = "test@test.com"; password = "test" } | ConvertTo-Json
            $response = Invoke-WebRequest -Uri $url -Method POST -Body $testData -ContentType "application/json" -ErrorAction SilentlyContinue
        } else {
            # Test GET endpoint
            $response = Invoke-WebRequest -Uri $url -ErrorAction SilentlyContinue
        }
        
        Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.StatusCode -eq 200) {
            $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($content.status) {
                Write-Host "  📊 Response: $($content.status)" -ForegroundColor Cyan
            }
        }
        
    } catch {
        $statusCode = "Unknown"
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        if ($statusCode -eq 404) {
            Write-Host "  ❌ 404 Not Found" -ForegroundColor Red
        } elseif ($statusCode -eq 400) {
            Write-Host "  ⚠️  400 Bad Request (endpoint exists but needs proper data)" -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Error: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "Testing completed!" -ForegroundColor Green 