# TCManager Railway Deployment Guide

## Prerequisites
1. Railway account (https://railway.app)
2. MongoDB Atlas account for cloud database
3. GitHub repository with your TCM code

## Environment Variables for Railway

### Required Environment Variables
Set these in your Railway project environment:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tcmanager?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=production

# Client Configuration
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app

# CORS Configuration
CLIENT_URL=https://your-railway-frontend.up.railway.app

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Railway Deployment Steps

### Step 1: Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Link to existing project (if already created)
railway link
```

### Step 2: Deploy Backend Service
```bash
# Deploy the entire monorepo
railway up

# Or deploy specific service
railway up --service backend
```

### Step 3: Set Environment Variables
```bash
# Set variables via CLI
railway variables set MONGODB_URI="your-mongodb-connection-string"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set NODE_ENV="production"

# Or set via Railway dashboard
```

### Step 4: Configure Domain
1. Go to Railway dashboard
2. Click on your service
3. Go to Settings → Domains
4. Generate domain or add custom domain

## Database Setup (MongoDB Atlas)

### Create MongoDB Atlas Cluster
1. Go to https://cloud.mongodb.com
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for Railway)
5. Get connection string

### Example Connection String
```
mongodb+srv://tcm-user:password@cluster0.xxxxx.mongodb.net/tcmanager?retryWrites=true&w=majority
```

## Health Check Verification
Once deployed, verify your service:
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-06-17T22:33:23.613Z",
  "uptime": 8.539093377,
  "environment": "production"
}
```

## ✅ Deployment Success - Option C Architecture

### **Production Deployment Complete**
- **URL**: https://tcmanger-production.up.railway.app
- **Architecture**: Single service deployment (Frontend + Backend)
- **Status**: ✅ Fully operational

### **How Option C Works**
1. **Frontend**: Next.js static export served by Express
2. **Backend**: Express API routes at `/api/*`
3. **Routing**: Express serves React app for all non-API routes
4. **Benefits**: No CORS issues, single deployment, cost-effective

## Troubleshooting

### ✅ Issues Resolved
1. **TypeScript compilation fails**: `tsc: not found`
   - **Solution**: Moved TypeScript to `dependencies` in server/package.json
   - **Reason**: Railway production builds don't install devDependencies

2. **npm ci lockfile error**: `package-lock.json not found`
   - **Solution**: Switched from `npm ci` to `npm install` in postinstall script
   - **Reason**: package-lock.json files were ignored by .gitignore

3. **Nixpacks configuration error**: `undefined variable 'npm'`
   - **Solution**: Removed custom nixpacks.toml, using Railway's default detection
   - **Reason**: Invalid nixpacks syntax for npm package

4. **Material-UI SSR error**: `createTheme() from server`
   - **Solution**: Created client-side ThemeProvider component with 'use client' directive
   - **Reason**: Next.js 14 App Router server/client component separation

5. **Redux store warning**: `Store does not have a valid reducer`
   - **Solution**: Added app slice with valid reducer to Redux store
   - **Reason**: Empty reducer object not allowed

### Common Issues (If They Occur)
1. **Build fails**: Check package.json scripts
2. **Database connection fails**: Verify MONGODB_URI
3. **Port issues**: Railway automatically assigns PORT
4. **Frontend not loading**: Check static file serving in Express

### Logs
View deployment logs:
```bash
railway logs
```

## Security Checklist
- [ ] Strong JWT_SECRET (minimum 32 characters)
- [ ] MongoDB user has minimal required permissions
- [ ] IP whitelist configured (if needed)
- [ ] Environment variables are secure
- [ ] HTTPS is enabled (automatic with Railway) 