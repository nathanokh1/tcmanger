# Create Demo User Script for TCManager
Write-Host "Creating/Testing Demo User for TCManager..." -ForegroundColor Yellow

$baseUrl = "https://tcmanger-production.up.railway.app"

# Test if API is responding
Write-Host "`nTesting API health..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ API Health: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "Environment: $($healthResponse.environment)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test login with demo credentials
Write-Host "`nTesting demo login..." -ForegroundColor Cyan

$loginData = @{
    email = "demo@tcmanager.com"
    password = "demo123"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -Headers $headers
    Write-Host "✅ Demo login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.user.name)" -ForegroundColor Gray
    Write-Host "Role: $($loginResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Demo login failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to create the demo user
    Write-Host "`nAttempting to create demo user..." -ForegroundColor Yellow
    
    $registerData = @{
        name = "Demo User"
        email = "demo@tcmanager.com"
        password = "demo123"
        role = "user"
        tenantId = "demo-company"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -Headers $headers
        Write-Host "✅ Demo user created successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not create demo user: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test other common credentials
$testCredentials = @(
    @{ email = "admin@tcmanager.com"; password = "admin123" },
    @{ email = "testuser@company.com"; password = "password123" }
)

Write-Host "`nTesting other credentials..." -ForegroundColor Cyan

foreach ($cred in $testCredentials) {
    $testLoginData = @{
        email = $cred.email
        password = $cred.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $testLoginData -Headers $headers
        Write-Host "✅ Login successful: $($cred.email)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Login failed: $($cred.email)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Summary:" -ForegroundColor Yellow
Write-Host "Try logging in with these credentials:" -ForegroundColor White
Write-Host "  Email: demo@tcmanager.com" -ForegroundColor Gray
Write-Host "  Password: demo123" -ForegroundColor Gray
Write-Host ""
Write-Host "If that doesn't work, try:" -ForegroundColor White  
Write-Host "  Email: admin@tcmanager.com" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray 