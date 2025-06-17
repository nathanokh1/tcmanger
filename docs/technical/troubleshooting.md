# TCManager Troubleshooting Guide

## Common Issues and Solutions

### Port Conflicts

#### Issue: Port 3000 or 3001 is already in use
**Symptoms:**
- Error message: "Something is already running on port 3000/3001"
- Unable to start backend or frontend servers

**Solutions:**
1. Find processes using the ports:
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. Kill the processes:
   ```powershell
   taskkill /PID <process_id> /F
   ```

3. Alternative: Use different ports
   - Backend: Set PORT in .env file
   - Frontend: Use `npm start -- --port 3002`

### MongoDB Connection Issues

#### Issue: Cannot connect to MongoDB
**Symptoms:**
- Connection timeout errors
- "MongoDB server not running" errors

**Solutions:**
1. Verify MongoDB is running:
   ```powershell
   netstat -ano | findstr :27018
   ```

2. Check MongoDB service:
   ```powershell
   ./start_mongodb.bat
   ```

3. Verify connection string in .env:
   ```
   MONGODB_URI=mongodb://localhost:27018/tcmanager
   ```

### Authentication Issues

#### Issue: Login failures
**Solutions:**
1. Verify correct credentials from startup guide
2. Check if account is verified
3. Clear browser cache and cookies
4. Check JWT_SECRET in .env file

### Frontend Build Issues

#### Issue: npm install failures
**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

#### Issue: TypeScript compilation errors
**Solutions:**
1. Update TypeScript:
   ```bash
   npm install typescript@latest
   ```

2. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache/typescript
   ```

### Backend API Issues

#### Issue: API endpoints not responding
**Solutions:**
1. Check if backend server is running
2. Verify API routes in api-docs.md
3. Check CORS configuration
4. Verify request headers and authentication

### Database Issues

#### Issue: Data not persisting
**Solutions:**
1. Check MongoDB connection
2. Verify database path in start_mongodb.bat
3. Check for proper indexes
4. Verify data models match schema

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/yourusername/tcmanager/issues)
2. Review the [API Documentation](api-docs.md)
3. Consult the [Development Workflow](guides/workflow.md)
4. Contact the development team

## Logging

### Backend Logs
- Check `logs/` directory for detailed error logs
- Set `LOG_LEVEL=debug` in .env for verbose logging

### Frontend Logs
- Open browser developer tools (F12)
- Check Console tab for errors
- Check Network tab for API requests

## Performance Issues

### Slow API Responses
1. Check database indexes
2. Monitor MongoDB performance
3. Review API endpoint optimization
4. Check server resources

### Frontend Performance
1. Clear browser cache
2. Check for memory leaks
3. Review React component optimization
4. Monitor network requests

## Authentication Issues

### Login Not Working
If you encounter issues with login functionality, check the following:

1. **Port Configuration**
   - Backend server runs on port 3000 by default
   - Frontend API configuration (`frontend/src/services/api.ts`) should match the backend port
   - Current working configuration: `http://localhost:3000/api`

2. **Test User Credentials**
   - Admin account is confirmed working:
     ```
     Email: admin@tcmanager.com
     Password: admin123!
     ```
   - Other test accounts available but not verified:
     ```
     QA: qa@tcmanager.com / qa123456!
     Developer: dev@tcmanager.com / dev123456!
     Viewer: viewer@tcmanager.com / viewer123!
     ```

3. **Common Error Messages**
   - `ERR_CONNECTION_REFUSED`: Usually indicates the backend server is not running or running on a different port
   - `404 Not Found`: Check if the auth routes are properly configured in the backend
   - `401 Unauthorized`: Check if the credentials match the seeded test users

## Backend Server Issues

### TypeScript Compilation Errors
Common TypeScript errors and their solutions:

1. **Unused Imports**
   - Remove unused imports (e.g., bcrypt if not directly used in the file)
   - Keep only the imports that are actually used in the code

2. **Return Type Annotations**
   - Controller methods should specify return types: `Promise<Response>`
   - All code paths should have explicit returns
   - Example:
     ```typescript
     async login(req: Request, res: Response): Promise<Response> {
       try {
         // ... logic ...
         return res.json({ ... });
       } catch (error) {
         return res.status(500).json({ ... });
       }
     }
     ```

## Current Status

### Working Features
- MongoDB connection established
- User authentication system implemented
- Test users seeded in database
- Admin login functionality verified

### Pending Features
- User registration
- Role-based access control verification
- UI/UX improvements
- Frontend styling and theme customization

## Next Steps
1. Verify other test user accounts
2. Implement user registration
3. Add role-based access control
4. Enhance UI/UX design
5. Implement remaining API endpoints for projects, modules, and features

## Environment Setup Reminders
1. Backend server runs on port 3000
2. MongoDB runs on port 27018
3. Frontend development server typically runs on port 3001

## Useful Commands
```bash
# Start MongoDB
./start_mongodb.bat

# Start Backend Server
npm run dev

# Start Frontend
cd frontend && npm start
``` 