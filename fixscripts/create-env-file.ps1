# TCManager Environment Setup Script
# This script creates the .env file and sets up the development environment

Write-Host "🚀 Setting up TCManager Development Environment..." -ForegroundColor Green

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists. Backing up..." -ForegroundColor Yellow
    Copy-Item ".env" ".env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
}

# Create .env file content
$envContent = @"
# TCManager Environment Configuration

# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tcmanager_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024-$(Get-Random)
JWT_EXPIRES_IN=24h

# Redis Configuration (optional for local dev)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Email Configuration (for user invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@tcmanager.com

# Frontend URL
CLIENT_URL=http://localhost:3001

# Tenant Configuration
DEFAULT_TENANT=dev
MASTER_DOMAIN=localhost

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=./logs/tcmanager.log

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring & Health Checks
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true

# Demo/Test Data Configuration
SEED_DATABASE=true
CREATE_TEST_USERS=true
"@

# Write .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green

# Check if MongoDB is running
Write-Host "🔍 Checking MongoDB status..." -ForegroundColor Yellow

$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is already running" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB is not running" -ForegroundColor Red
    Write-Host "📋 To start MongoDB manually:" -ForegroundColor Cyan
    Write-Host "   1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "   2. Run: mongod --port 27017 --dbpath C:\data\db" -ForegroundColor White
    Write-Host "   3. Or use MongoDB Compass for GUI management" -ForegroundColor White
}

# Create necessary directories
$directories = @("logs", "uploads")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Ensure MongoDB is running (see above if not)" -ForegroundColor White
Write-Host "   2. Run: cd server && npm start" -ForegroundColor White
Write-Host "   3. Run: cd client && npm run dev" -ForegroundColor White
Write-Host "   4. Access: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Test Login Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@tcmanager.com" -ForegroundColor White
Write-Host "   Password: admin123!" -ForegroundColor White 