#!/usr/bin/env pwsh

Write-Host "Testing TypeScript Build for TCManager Server" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Navigate to server directory
Set-Location "../server"

Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Yellow

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
    exit 1
}

# Check if tsconfig.json exists
if (Test-Path "tsconfig.json") {
    Write-Host "✓ tsconfig.json found" -ForegroundColor Green
} else {
    Write-Host "✗ tsconfig.json not found" -ForegroundColor Red
    exit 1
}

# Run TypeScript compilation
Write-Host "Running TypeScript compilation..." -ForegroundColor Yellow
try {
    & npx tsc
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ TypeScript compilation successful!" -ForegroundColor Green
        
        # Try to start the server
        Write-Host "Attempting to start server..." -ForegroundColor Yellow
        & npm start
    } else {
        Write-Host "✗ TypeScript compilation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Running with --noEmit to show errors only..." -ForegroundColor Yellow
        & npx tsc --noEmit
    }
} catch {
    Write-Host "Error running TypeScript: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 