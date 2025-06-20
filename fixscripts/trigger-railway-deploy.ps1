#!/usr/bin/env pwsh

Write-Host "Triggering Railway Deployment with API Fix" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Navigate to project root
Set-Location ".."

Write-Host "Adding changes to git..." -ForegroundColor Yellow
git add server/src/index.ts
git add server/package.json

Write-Host "Committing API routing fix..." -ForegroundColor Yellow
git commit -m "CRITICAL FIX: Prevent static middleware from intercepting API routes in production

- Fixed static file middleware that was catching /api/* and /health requests
- API routes now properly accessible in Railway production
- Static files now served with specific paths to avoid conflicts"

Write-Host "Pushing to trigger Railway deployment..." -ForegroundColor Yellow
git push origin master

Write-Host "✅ Deployment triggered!" -ForegroundColor Green
Write-Host ""
Write-Host "Wait 2-3 minutes for Railway to rebuild, then test:" -ForegroundColor Cyan
Write-Host "https://tcmanager-production.up.railway.app/health" -ForegroundColor Yellow
Write-Host "https://tcmanager-production.up.railway.app/api/auth/login" -ForegroundColor Yellow 