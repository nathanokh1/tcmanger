#!/usr/bin/env pwsh

Write-Host "Quick Build Test for TCManager" -ForegroundColor Green

Set-Location "../server"

Write-Host "Testing TypeScript compilation..." -ForegroundColor Yellow

try {
    $output = & npx tsc 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build SUCCESS!" -ForegroundColor Green
        Write-Host "Starting server..." -ForegroundColor Yellow
        & npm start
    } else {
        Write-Host "✗ Build FAILED:" -ForegroundColor Red
        Write-Host $output -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} 