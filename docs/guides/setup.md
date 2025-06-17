# TCManager Development Environment Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18 or higher
- MongoDB 5 or higher
- Git
- npm 9 or higher
- Visual Studio Code (recommended)
- MongoDB Compass (recommended)

## Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/tcmanager.git
   cd tcmanager
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   Create `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27018/tcmanager
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

4. **MongoDB Setup**
   - Create data directory:
     ```bash
     mkdir C:\data\db
     ```
   - Start MongoDB server:
     ```bash
     ./start_mongodb.bat
     ```
   - Verify connection:
     ```bash
     mongosh mongodb://localhost:27018
     ```

5. **Database Initialization**
   ```bash
   # Seed test data
   npm run seed
   ```

## Development Workflow

1. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. **Access the Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - MongoDB: mongodb://localhost:27018

3. **Test Accounts**
   ```
   Admin:
   Email: admin@tcmanager.com
   Password: admin123!

   QA:
   Email: qa@tcmanager.com
   Password: qa123456!

   Developer:
   Email: dev@tcmanager.com
   Password: dev123456!

   Viewer:
   Email: viewer@tcmanager.com
   Password: viewer123!
   ```

## IDE Setup

### Visual Studio Code
Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- MongoDB for VS Code
- GitLens
- Error Lens

### Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Testing Setup

1. **Install Testing Dependencies**
   ```bash
   npm install --save-dev jest @types/jest ts-jest
   ```

2. **Run Tests**
   ```bash
   # Run all tests
   npm test

   # Run specific test file
   npm test -- src/test/auth.test.ts

   # Run tests in watch mode
   npm test -- --watch
   ```

## Common Issues

### Port Conflicts
If ports 3000 or 3001 are in use:
1. Find processes:
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```
2. Kill processes:
   ```powershell
   taskkill /PID <process_id> /F
   ```

### MongoDB Issues
If MongoDB fails to start:
1. Check if port 27018 is available
2. Verify data directory exists
3. Check MongoDB logs

### Build Issues
If you encounter build errors:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Additional Resources

- [API Documentation](../technical/api-docs.md)
- [Architecture Overview](../technical/architecture.md)
- [Database Schema](../technical/database-schema.md)
- [Testing Guide](testing.md)
- [Contributing Guidelines](contributing.md)
- [Troubleshooting Guide](../technical/troubleshooting.md) 