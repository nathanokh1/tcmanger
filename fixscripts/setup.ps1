# TCManager Setup Script for Windows
# This script sets up the development environment for TCManager

Write-Host "🚀 TCManager Development Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is available (optional for local development)
Write-Host "Checking MongoDB availability..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB not running locally (you can use MongoDB Atlas)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  MongoDB not detected (you can use MongoDB Atlas)" -ForegroundColor Yellow
}

# Create .env file if it doesn't exist
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
if (!(Test-Path "../.env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    $envContent = @"
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tcmanager
MONGODB_TEST_URI=mongodb://localhost:27017/tcmanager_test

# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=tcm-super-secret-development-key-change-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
CLIENT_URL=http://localhost:3001

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug

# Security
SECURE_COOKIES=false
TRUST_PROXY=false
"@
    
    Set-Content -Path "../.env" -Value $envContent
    Write-Host "✅ Created .env file with development defaults" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "Installing root dependencies..." -ForegroundColor Blue
Set-Location ".."
npm install

Write-Host "Installing server dependencies..." -ForegroundColor Blue
Set-Location "server"
npm install

Write-Host "Installing client dependencies..." -ForegroundColor Blue
Set-Location "../client"
npm install

Set-Location ".."

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start Commands:" -ForegroundColor Yellow
Write-Host "  npm run dev          # Start both frontend and backend" -ForegroundColor White
Write-Host "  npm run server:dev   # Start backend only (port 3000)" -ForegroundColor White
Write-Host "  npm run client:dev   # Start frontend only (port 3001)" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Health:   http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If using local MongoDB, start it: 'mongod'" -ForegroundColor White
Write-Host "2. Or update .env with MongoDB Atlas connection string" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the application" -ForegroundColor White 