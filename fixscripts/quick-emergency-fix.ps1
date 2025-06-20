#!/usr/bin/env pwsh

Write-Host "Emergency Frontend Restoration" -ForegroundColor Red
Write-Host "==============================" -ForegroundColor Red

Set-Location ".."

Write-Host "Adding fixes..." -ForegroundColor Yellow
git add .

Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "Emergency fix: Restore Next.js frontend"

Write-Host "Pushing..." -ForegroundColor Yellow
git push origin master

Write-Host "DONE! Wait 3-4 minutes for Railway rebuild" -ForegroundColor Green 