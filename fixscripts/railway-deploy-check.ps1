# Railway Deployment Check Script for TCManager
# This script helps verify the Railway deployment is working correctly

Write-Host "🚀 TCManager Railway Deployment Check" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$railwayUrl = "https://tcmanger-production.up.railway.app"

Write-Host "📡 Testing Railway deployment at: $railwayUrl" -ForegroundColor Yellow
Write-Host ""

# Test health endpoint
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Green
try {
    $healthResponse = Invoke-RestMethod -Uri "$railwayUrl/health" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Health Check: OK" -ForegroundColor Green
    Write-Host "   📊 Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "   🌍 Environment: $($healthResponse.environment)" -ForegroundColor White
    Write-Host "   ⏱️ Uptime: $($healthResponse.uptime) seconds" -ForegroundColor White
} catch {
    Write-Host "   ❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test main page
Write-Host "2. Testing Main Page..." -ForegroundColor Green
try {
    $mainResponse = Invoke-WebRequest -Uri $railwayUrl -Method GET -TimeoutSec 10
    if ($mainResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Main Page: OK (Status $($mainResponse.StatusCode))" -ForegroundColor Green
        if ($mainResponse.Content -like "*TCManager*") {
            Write-Host "   📄 Content: TCManager app detected" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ❌ Main Page Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test API endpoints
Write-Host "3. Testing API Endpoints..." -ForegroundColor Green
$apiEndpoints = @(
    "/api/auth",
    "/api/projects", 
    "/api/testcases",
    "/api/testruns",
    "/api/users"
)

foreach ($endpoint in $apiEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$railwayUrl$endpoint" -Method GET -TimeoutSec 5
        Write-Host "   ✅ $endpoint : Status $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401 -or $statusCode -eq 404) {
            Write-Host "   ✅ $endpoint : Status $statusCode (Expected for protected/unimplemented routes)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $endpoint : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "   🌐 Railway App: $railwayUrl" -ForegroundColor White
Write-Host "   🏥 Health Check: $railwayUrl/health" -ForegroundColor White  
Write-Host "   📡 API Base: $railwayUrl/api" -ForegroundColor White

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open $railwayUrl in your browser" -ForegroundColor White
Write-Host "   2. The app should show a functional web interface" -ForegroundColor White
Write-Host "   3. Use the 'Test API Connection' button to verify backend" -ForegroundColor White
Write-Host "   4. Start developing directly on Railway!" -ForegroundColor White

Write-Host ""
Write-Host "✨ No more localhost required - develop directly on Railway! ✨" -ForegroundColor Green 