# Railway Deployment Diagnostic Script
# This script helps diagnose issues with the TCManager Railway deployment

Write-Host "TCManager Railway Deployment Diagnostics" -ForegroundColor Yellow
Write-Host "============================================="

Write-Host "`n1. Testing Railway Application Status..." -ForegroundColor Cyan

# Test different endpoints
$endpoints = @(
    "https://tcmanager-production.up.railway.app/",
    "https://tcmanager-production.up.railway.app/health", 
    "https://tcmanager-production.up.railway.app/api"
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "Testing: $endpoint" -ForegroundColor White
        $response = Invoke-WebRequest -Uri $endpoint -UseBasicParsing -TimeoutSec 10
        Write-Host "  SUCCESS Status: $($response.StatusCode)" -ForegroundColor Green
        if ($response.Content.Length -lt 200) {
            Write-Host "  Content: $($response.Content)" -ForegroundColor Gray
        } else {
            Write-Host "  Content Length: $($response.Content.Length) characters" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "`n2. Checking Build Configuration..." -ForegroundColor Cyan

# Check if key files exist
$keyFiles = @(
    "package.json",
    "railway.toml",
    "server/package.json", 
    "client/package.json"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "  SUCCESS: $file exists" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file not found" -ForegroundColor Red
    }
}

Write-Host "`n3. Quick Build Test..." -ForegroundColor Cyan

# Test if we can build locally
try {
    Write-Host "Testing server TypeScript compilation..." -ForegroundColor White
    Set-Location "server"
    $result = npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: Server builds locally" -ForegroundColor Green
    } else {
        Write-Host "  FAILED: Server build has issues" -ForegroundColor Red
    }
    Set-Location ".."
} catch {
    Write-Host "  ERROR: Cannot test server build" -ForegroundColor Red
    Set-Location ".."
}

Write-Host "`n4. Summary and Recommendations..." -ForegroundColor Cyan
Write-Host "Based on the 'Application not found' error, the Railway deployment is likely failing." -ForegroundColor Yellow
Write-Host ""
Write-Host "Common causes:" -ForegroundColor White
Write-Host "  - Build process failing during deployment" -ForegroundColor Gray
Write-Host "  - Environment variables not set in Railway dashboard" -ForegroundColor Gray
Write-Host "  - MongoDB connection string missing" -ForegroundColor Gray
Write-Host "  - Node.js version mismatch" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Check Railway deployment logs in the dashboard" -ForegroundColor Gray
Write-Host "  2. Verify environment variables are set" -ForegroundColor Gray
Write-Host "  3. Test local build with: npm run build" -ForegroundColor Gray
Write-Host "  4. Force redeploy with: git commit --allow-empty -m 'trigger deploy' && git push" -ForegroundColor Gray

Write-Host "`nDiagnostic Complete!" -ForegroundColor Green 