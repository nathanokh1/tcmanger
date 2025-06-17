# TCManager Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the TCManager application in various environments. The application consists of a Node.js backend and a React frontend.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git
- npm or yarn
- PM2 (for production deployment)

## Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/tcmanager.git
   cd tcmanager
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Variables**

   Create `.env` files in both backend and frontend directories:

   Backend `.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/tcmanager
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

   Frontend `.env`:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   REACT_APP_ENV=development
   ```

## Development Deployment

1. **Start MongoDB**
   ```bash
   # Windows
   "C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe" --dbpath="C:\data\db"

   # Linux/Mac
   mongod --dbpath /data/db
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

## Production Deployment

### Backend Deployment

1. **Build the Backend**
   ```bash
   cd backend
   npm run build
   ```

2. **Configure PM2**
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'tcmanager-backend',
       script: 'dist/server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         MONGODB_URI: 'mongodb://localhost:27017/tcmanager',
         JWT_SECRET: 'your-secret-key'
       }
     }]
   };
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

### Frontend Deployment

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve with Nginx**

   Create Nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /path/to/tcmanager/frontend/build;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Start Nginx**
   ```bash
   sudo systemctl start nginx
   ```

## Docker Deployment

1. **Build Docker Images**
   ```bash
   # Build backend image
   docker build -t tcmanager-backend ./backend

   # Build frontend image
   docker build -t tcmanager-frontend ./frontend
   ```

2. **Create Docker Compose File**
   ```yaml
   version: '3.8'

   services:
     mongodb:
       image: mongo:4.4
       volumes:
         - mongodb_data:/data/db
       ports:
         - "27017:27017"

     backend:
       image: tcmanager-backend
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongodb:27017/tcmanager
         - JWT_SECRET=your-secret-key
       ports:
         - "3000:3000"
       depends_on:
         - mongodb

     frontend:
       image: tcmanager-frontend
       ports:
         - "80:80"
       depends_on:
         - backend

   volumes:
     mongodb_data:
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## SSL Configuration

1. **Obtain SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

2. **Update Nginx Configuration**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       # ... rest of the configuration ...
   }

   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

## Monitoring Setup

1. **Install Monitoring Tools**
   ```bash
   # Install PM2 monitoring
   pm2 install pm2-logrotate
   pm2 install pm2-server-monit

   # Configure log rotation
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. **Setup Health Checks**
   ```bash
   # Create health check script
   cat > health-check.sh << 'EOF'
   #!/bin/bash
   curl -f http://localhost:3000/api/health || exit 1
   EOF

   chmod +x health-check.sh
   ```

## Backup Strategy

1. **Database Backup**
   ```bash
   # Create backup script
   cat > backup.sh << 'EOF'
   #!/bin/bash
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/path/to/backups"
   mongodump --uri="mongodb://localhost:27017/tcmanager" --out="$BACKUP_DIR/$TIMESTAMP"
   EOF

   chmod +x backup.sh
   ```

2. **Schedule Backups**
   ```bash
   # Add to crontab
   0 0 * * * /path/to/backup.sh
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Check if MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **Backend API Issues**
   - Check logs: `pm2 logs tcmanager-backend`
   - Verify environment variables
   - Check MongoDB connection

3. **Frontend Issues**
   - Check browser console for errors
   - Verify API URL configuration
   - Check network requests

### Logs

- Backend logs: `pm2 logs tcmanager-backend`
- Nginx logs: `/var/log/nginx/error.log`
- MongoDB logs: `/var/log/mongodb/mongod.log`

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure secrets management
   - Rotate secrets regularly

2. **Network Security**
   - Use firewall rules
   - Enable SSL/TLS
   - Implement rate limiting

3. **Database Security**
   - Enable authentication
   - Use strong passwords
   - Regular security updates

## Scaling

1. **Horizontal Scaling**
   - Use PM2 cluster mode
   - Implement load balancing
   - Use MongoDB replication

2. **Vertical Scaling**
   - Increase server resources
   - Optimize database queries
   - Implement caching

## Maintenance

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm update

   # Update PM2
   npm install pm2 -g

   # Update MongoDB
   # Follow MongoDB upgrade guide
   ```

2. **Monitoring**
   - Check PM2 status
   - Monitor resource usage
   - Review logs regularly

3. **Backup Verification**
   - Test backup restoration
   - Verify backup integrity
   - Update backup strategy

## Rollback Procedure

1. **Code Rollback**
   ```bash
   # Revert to previous version
   git checkout <previous-commit>
   npm install
   npm run build
   pm2 restart tcmanager-backend
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   mongorestore --uri="mongodb://localhost:27017/tcmanager" /path/to/backup
   ```

## Support

For deployment issues:
1. Check the troubleshooting guide
2. Review logs
3. Contact support team
4. Create GitHub issue 