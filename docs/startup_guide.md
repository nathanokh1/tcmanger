# TCManager Startup Guide

## Quick Start

1. **Start MongoDB Server**
   ```bash
   ./start_mongodb.bat
   ```
   MongoDB will run on port 27018

2. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Backend will run on port 3000

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on port 3001

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:3001`
   - Login with the admin account:
     ```
     Email: admin@tcmanager.com
     Password: admin123!
     ```

## Available Test Accounts

| Role      | Email                  | Password    | Status      |
|-----------|------------------------|-------------|-------------|
| Admin     | admin@tcmanager.com    | admin123!   | Verified    |
| QA        | qa@tcmanager.com       | qa123456!   | Not Verified|
| Developer | dev@tcmanager.com      | dev123456!  | Not Verified|
| Viewer    | viewer@tcmanager.com   | viewer123!  | Not Verified|

## System Requirements

### Software Versions
- Node.js 18+
- MongoDB 5+
- npm 9+

### Port Configuration
- MongoDB: 27018
- Backend API: 3000
- Frontend Dev Server: 3001

### Environment Variables
The following environment variables are used:
- `PORT`: Backend server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27018/tcmanager)
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment mode (development/production)

## Troubleshooting
For common issues and their solutions, refer to `docs/technical/troubleshooting.md`

## Next Steps
After successful startup:
1. Verify your login credentials work
2. Explore the dashboard interface
3. Check the role-based access controls
4. Start creating projects and test cases

## Development Workflow
For detailed development guidelines and workflow, refer to `docs/guides/workflow.md` 