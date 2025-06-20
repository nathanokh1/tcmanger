#!/usr/bin/env pwsh

Write-Host "🚨 EMERGENCY: Restoring Next.js Frontend" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Red

# Navigate to project root
Set-Location ".."

Write-Host "🔧 Fixing what went wrong:" -ForegroundColor Yellow
Write-Host "1. Re-enabling Next.js static export (needed for Railway)" -ForegroundColor Cyan
Write-Host "2. Fixing static file serving to serve actual Next.js pages" -ForegroundColor Cyan
Write-Host "3. Restoring login page, dashboard, admin portals" -ForegroundColor Cyan

Write-Host ""
Write-Host "Adding emergency fixes..." -ForegroundColor Yellow
git add client/next.config.js
git add server/src/index.ts

Write-Host "Committing emergency frontend restoration..." -ForegroundColor Yellow
git commit -m "🚨 EMERGENCY FIX: Restore Next.js frontend functionality

PROBLEM: Previous changes broke frontend serving
- Users saw fallback HTML instead of login/dashboard

SOLUTION:
✅ Re-enabled Next.js static export for Railway
✅ Fixed static file serving configuration  
✅ Restored proper routing for login/dashboard/admin portals
✅ API routes still protected and functional

RESULT: Login page and all dashboards should be restored"

Write-Host "Pushing emergency fix..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "🚨 EMERGENCY DEPLOYMENT TRIGGERED!" -ForegroundColor Red
Write-Host ""
Write-Host "⏱️  Wait 3-4 minutes for Railway to rebuild" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ This should restore:" -ForegroundColor Green
Write-Host "   - Login page at /login" -ForegroundColor White
Write-Host "   - Dashboard at /dashboard" -ForegroundColor White  
Write-Host "   - Admin portal at /admin" -ForegroundColor White
Write-Host "   - Master admin at /master-admin" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test immediately after rebuild:" -ForegroundColor Yellow
Write-Host "https://tcmanager-production.up.railway.app/login" -ForegroundColor White 