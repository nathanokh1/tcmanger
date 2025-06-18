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

## Troubleshooting

### Common Issues
1. **Build fails**: Check package.json scripts
2. **TypeScript compilation fails**: `tsc: not found`
   - **Solution**: TypeScript moved to `dependencies` in server/package.json
   - **Reason**: Railway production builds don't install devDependencies
3. **Database connection fails**: Verify MONGODB_URI
4. **Port issues**: Railway automatically assigns PORT
5. **CORS errors**: Update CLIENT_URL environment variable

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