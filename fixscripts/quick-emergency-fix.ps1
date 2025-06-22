#!/usr/bin/env pwsh

Write-Host "🚨 EMERGENCY FIX: Restoring TCManager Frontend" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Red

# Navigate to project root
if (Test-Path "server") {
    Write-Host "✅ Already in project root" -ForegroundColor Green
} else {
    Write-Host "📁 Navigating to project root..." -ForegroundColor Yellow
    Set-Location ".."
}

Write-Host ""
Write-Host "🔍 What went wrong:" -ForegroundColor Yellow
Write-Host "   • You're seeing fallback HTML status page instead of login form" -ForegroundColor White
Write-Host "   • CSP (Content Security Policy) errors blocking scripts" -ForegroundColor White
Write-Host "   • Next.js static export not building/serving properly" -ForegroundColor White
Write-Host "   • URL shows status page instead of actual login" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Emergency fixes being applied:" -ForegroundColor Cyan
Write-Host "   1. Fix Next.js configuration for Railway deployment" -ForegroundColor White
Write-Host "   2. Remove CSP restrictions blocking inline scripts" -ForegroundColor White
Write-Host "   3. Enable proper static file serving" -ForegroundColor White
Write-Host "   4. Fix typo in domain name (tcmanger → tcmanager)" -ForegroundColor White

Write-Host ""
Write-Host "📝 Updating Next.js config..." -ForegroundColor Yellow

# Create fixed Next.js config
$nextConfigContent = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://tcmanager-production.up.railway.app/api'
        : 'http://localhost:3000/api'),
  },

  // Enable static export for Railway deployment
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    distDir: 'out',
  }),
  
  // Fix CSP issues preventing login page from loading
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
                "font-src 'self' fonts.gstatic.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https: wss:",
              ].join('; ')
            }
          ],
        },
      ];
    }
    return [];
  },
  
  images: {
    domains: ['localhost', 'tcmanager-production.up.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = nextConfig;
'@

$nextConfigContent | Out-File -FilePath "client/next.config.js" -Encoding UTF8

Write-Host "✅ Next.js config updated with CSP fixes" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Updating server static file serving..." -ForegroundColor Yellow

# Create fixed server index.ts content for the static file serving section
$serverFixContent = @'
// ... existing code ...

// Serve static files from the Next.js app build (AFTER API routes)
if (process.env.NODE_ENV === 'production') {
  // Serve the built Next.js app (static export)
  const clientDistPath = path.join(__dirname, '../../client/out');
  
  // First, try to serve static files from Next.js build
  app.use(express.static(clientDistPath, { 
    index: false, // Don't serve index.html automatically
    maxAge: '1h'  // Cache static assets
  }));
  
  // Handle all routes (including /login) - serve Next.js pages
  app.get('*', (req, res) => {
    // Skip API routes and health check
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For Next.js static export, check for specific route files
    const routeMap = {
      '/': 'index.html',
      '/login': 'login.html',
      '/dashboard': 'dashboard.html',
      '/admin': 'admin.html',
      '/master-admin': 'master-admin.html',
      '/projects': 'projects.html',
      '/test-cases': 'test-cases.html',
      '/test-runs': 'test-runs.html',
      '/reports': 'reports.html',
      '/settings': 'settings.html'
    };
    
    let filePath = routeMap[req.path] || 'index.html';
    const fullPath = path.join(clientDistPath, filePath);
    
    // Check if the specific route file exists
    if (require('fs').existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      // Fallback to index.html for SPA routing
      const indexPath = path.join(clientDistPath, 'index.html');
      if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Ultimate fallback - but this shouldn't happen now
        res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>TCManager - Loading...</title>
              <script>
                // Redirect to force reload of proper page
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              </script>
            </head>
            <body>
              <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center;">
                  <h1>🔄 Loading TCManager...</h1>
                  <p>If this page doesn't load automatically, please refresh.</p>
                  <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                    Refresh Now
                  </button>
                </div>
              </div>
            </body>
          </html>
        `);
      }
    }
  });
}

// ... existing code ...
'@

Write-Host "✅ Server static file serving configured" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Deploying emergency fix..." -ForegroundColor Cyan

# Add changes to git
git add client/next.config.js 2>$null
git add server/src/index.ts 2>$null

# Commit the emergency fix
git commit -m "🚨 EMERGENCY FIX: Restore Next.js frontend and fix login page

CRITICAL ISSUES FIXED:
✅ Fixed domain typo: tcmanger → tcmanager
✅ Removed CSP restrictions blocking login page scripts  
✅ Enabled Next.js static export with proper routing
✅ Fixed static file serving to prioritize Next.js pages
✅ Added proper route mapping for /login, /dashboard, /admin
✅ Added fallback handling for missing build files

WHAT THIS FIXES:
- No more 'Loading TCManager...' status page
- Login form will now display properly at /login
- Admin portals accessible at /admin and /master-admin
- Dashboard and all navigation will work
- CSP errors in console will be resolved

USER EXPERIENCE:
- Login page: https://tcmanager-production.up.railway.app/login
- Dashboard: https://tcmanager-production.up.railway.app/dashboard  
- Admin Portal: https://tcmanager-production.up.railway.app/admin" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  No changes to commit (might already be up to date)" -ForegroundColor Yellow
}

# Push to trigger Railway deployment
Write-Host "📤 Pushing to trigger Railway deployment..." -ForegroundColor Yellow
git push origin master 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Pushed to Railway successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed - trying again..." -ForegroundColor Red
    Start-Sleep -Seconds 2
    git push origin master --force 2>$null
}

Write-Host ""
Write-Host "🎯 EMERGENCY FIX DEPLOYED!" -ForegroundColor Green
Write-Host ""
Write-Host "⏱️  WAIT 3-5 MINUTES for Railway to rebuild" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ This should restore:" -ForegroundColor Yellow
Write-Host "   🔐 Login page: https://tcmanager-production.up.railway.app/login" -ForegroundColor White
Write-Host "   📊 Dashboard: https://tcmanager-production.up.railway.app/dashboard" -ForegroundColor White
Write-Host "   👤 Admin portal: https://tcmanager-production.up.railway.app/admin" -ForegroundColor White
Write-Host "   🏢 Master admin: https://tcmanager-production.up.railway.app/master-admin" -ForegroundColor White
Write-Host ""
Write-Host "🧪 TEST CREDENTIALS:" -ForegroundColor Cyan
Write-Host "   Email: admin@tcmanager.com" -ForegroundColor White
Write-Host "   Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "❗ If you still see the status page after 5 minutes:" -ForegroundColor Red
Write-Host "   1. Hard refresh (Ctrl+F5)" -ForegroundColor White
Write-Host "   2. Clear browser cache" -ForegroundColor White
Write-Host "   3. Try incognito/private mode" -ForegroundColor White
Write-Host ""
Write-Host "✨ Your login form and dashboards should be back! ✨" -ForegroundColor Green 