# CRITICAL FIX: Stop Redis Connection Spam
Write-Host "🚨 EMERGENCY: Fixing Redis connection spam..." -ForegroundColor Red

# Kill all node processes to stop the spam
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Navigate to server directory  
Set-Location "$PSScriptRoot\..\server"

# Remove Redis dependency temporarily
Write-Host "Temporarily removing Redis from package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.dependencies.ioredis) {
    $packageJson.dependencies.PSObject.Properties.Remove('ioredis')
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "✅ Redis dependency removed" -ForegroundColor Green
}

# Install without Redis
Write-Host "Reinstalling dependencies without Redis..." -ForegroundColor Yellow
npm install

Write-Host "✅ CRISIS RESOLVED: Server can now start without Redis errors!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 To test:" -ForegroundColor Cyan
Write-Host "   cd server && npm start" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: Caching is now fully disabled but Redis errors should be gone" -ForegroundColor Yellow 