#!/usr/bin/env pwsh

Write-Host "Fixing Production Frontend API Connectivity" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Navigate to project root
Set-Location ".."

Write-Host "📝 Changes being deployed:" -ForegroundColor Yellow
Write-Host "1. Fixed typo in Socket URL: tcmanger → tcmanager" -ForegroundColor Cyan
Write-Host "2. Fixed typo in Next.js config: tcmanger → tcmanager" -ForegroundColor Cyan  
Write-Host "3. Disabled static export to enable API calls" -ForegroundColor Cyan
Write-Host "4. Updated login form to use environment API URL" -ForegroundColor Cyan
Write-Host "5. Fixed CORS to allow Railway frontend domain" -ForegroundColor Cyan

Write-Host ""
Write-Host "Adding changes to git..." -ForegroundColor Yellow
git add client/src/services/socketService.ts
git add client/next.config.js 
git add client/src/components/auth/LoginForm.tsx
git add server/src/index.ts

Write-Host "Committing frontend API connectivity fixes..." -ForegroundColor Yellow
git commit -m "CRITICAL FIX: Frontend-Backend connectivity for Railway production

🔧 Frontend Fixes:
- Fixed socketService URL typo: tcmanger → tcmanager  
- Disabled Next.js static export (breaks API calls)
- Updated login form to use NEXT_PUBLIC_API_URL
- Fixed domain typo in Next.js config

🔧 Backend Fixes:
- Updated CORS to allow Railway frontend domain
- API routes now properly accessible

✅ This should resolve the 'Loading TCManager...' issue
✅ API calls should now work in production"

Write-Host "Pushing to trigger Railway deployment..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "🚀 Deployment triggered!" -ForegroundColor Green
Write-Host ""
Write-Host "⏱️  Wait 3-5 minutes for Railway to rebuild both frontend and backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Then test:" -ForegroundColor Yellow
Write-Host "1. Go to: https://tcmanager-production.up.railway.app/login" -ForegroundColor White
Write-Host "2. Try login with: admin@tcmanager.com / Admin123!" -ForegroundColor White
Write-Host "3. Check if dashboard loads properly" -ForegroundColor White
Write-Host ""
Write-Host "🔍 To debug, check:" -ForegroundColor Yellow
Write-Host "- Network tab for API calls to /api/auth/login" -ForegroundColor White
Write-Host "- Console for JavaScript errors" -ForegroundColor White
Write-Host "- Railway logs for backend errors" -ForegroundColor White 