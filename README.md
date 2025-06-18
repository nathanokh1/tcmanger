# TCManager - Test Case Management Platform

A modern, full-stack test case management platform built for QA teams and developers. Features rich test case authoring, execution tracking, reporting, and seamless CI/CD integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm 9+

### Local Development

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd TCM
   npm run setup
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # Minimum required:
   # MONGODB_URI=mongodb://localhost:27017/tcmanager
   # JWT_SECRET=your-super-secret-key
   ```

3. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run server:dev  # Backend on port 3000
   npm run client:dev  # Frontend on port 3001
   ```

4. **Access the Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

### ✅ Production Deployment (Railway)

**🌐 Live Application**: https://tcmanger-production.up.railway.app

**Architecture**: Option C - Single Service Deployment
- Frontend: Next.js static export served by Express
- Backend: Express API routes at `/api/*`  
- Database: MongoDB Atlas cloud database
- Benefits: Cost-effective, no CORS issues, simplified management

1. **Automatic Deployment**
   ```bash
   # Deployment is automatic via GitHub integration
   git push origin master  # Triggers Railway build and deploy
   ```

2. **Manual Railway CLI (Optional)**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway up
   ```

3. **Environment Variables (Production)**
   Set these in Railway dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tcmanager
   JWT_SECRET=your-secure-32-character-secret-key
   ```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Material-UI, Redux Toolkit
- **Backend**: Node.js, Express, TypeScript, MongoDB
- **Authentication**: JWT with role-based access control
- **Deployment**: Railway with health checks and auto-scaling

### Project Structure
```
TCM/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── store/         # Redux store
│   │   └── styles/        # Themes and styles
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Utilities
│   └── package.json
├── docs/                  # Documentation
└── package.json          # Root package file
```

## 📋 Features

### Core Features
- ✅ **Test Case Management**: Rich editor with nested steps, expected results
- ✅ **Project Organization**: Hierarchical structure with tags and categories
- ✅ **User Management**: Role-based access (Admin, QA, Developer, Viewer)
- ✅ **Authentication**: Secure JWT-based auth with session management
- ✅ **Real-time Health Monitoring**: System status and uptime tracking

### Coming Soon
- 🚧 **Test Execution**: Run tracking with real-time results
- 🚧 **Reporting & Analytics**: Comprehensive dashboards and insights
- 🚧 **CI/CD Integration**: Webhook support for automated testing
- 🚧 **Playwright Integration**: Automated test result synchronization
- 🚧 **File Management**: Test attachments and screenshots
- 🚧 **Team Collaboration**: Comments, mentions, notifications

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
```

### Frontend Testing
```bash
cd client
npm test                    # Run component tests
npm run test:watch         # Watch mode
```

## 🚀 Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Write tests first (TDD approach)
3. Implement feature with documentation
4. Update relevant documentation
5. Test locally and on Railway staging
6. Create pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for both frontend and backend
- **Testing**: Jest with comprehensive coverage
- **Documentation**: Update docs with every feature

## 📊 Monitoring & Logging

### Health Checks
- **Endpoint**: `/health`
- **Monitors**: Database connection, uptime, environment
- **Railway**: Automatic health checks every 5 minutes

### Logging
- **Development**: Console with colors and formatting
- **Production**: File-based logging with rotation
- **Levels**: Error, Warn, Info, Debug

## 🔒 Security

### Backend Security
- **Helmet.js**: Security headers
- **Rate Limiting**: API protection
- **CORS**: Configured for frontend domain
- **JWT**: Secure token-based authentication
- **Bcrypt**: Password hashing with salt rounds

### Environment Security
- **Secret Management**: Environment variables only
- **Database**: Connection string encryption
- **HTTPS**: Enforced in production
- **Trust Proxy**: Railway proxy configuration

## 📝 API Documentation

### Health Check
```
GET /health
Response: {
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Authentication (Coming Soon)
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow TDD**: Write tests first
4. **Document changes**: Update relevant docs
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Create Pull Request**

## 📚 Documentation

- **Technical Docs**: `docs/technical/`
- **User Guides**: `docs/guides/`
- **Project Management**: `docs/project/`
- **API Reference**: `docs/technical/api-docs.md`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: `docs/` folder
- **Troubleshooting**: `docs/technical/troubleshooting.md`

---

**Built with ❤️ by the TCM Team** 