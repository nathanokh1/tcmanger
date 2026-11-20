# TCManager Startup Guide

## 🎉 **Production Ready!**

**🌐 Live Application**: https://tcmanger-production.up.railway.app  
**Status**: ✅ Fully deployed and operational  
**Architecture**: Single Service Deployment (Option C)  
**Progress**: 85% Complete - Enterprise-grade test management platform

---

## Quick Start Options

### **🚀 Use Production Instance (Recommended)**
1. **Access the Live Application**
   ```
   URL: https://tcmanger-production.up.railway.app
   ```

2. **Test User Accounts**
   ```
   Admin User:
   Email: admin@tcmanager.com
   Password: admin123!

   QA User:
   Email: qa@tcmanager.com
   Password: qa123456!

   Developer User:
   Email: dev@tcmanager.com
   Password: dev123456!

   Viewer User:
   Email: viewer@tcmanager.com
   Password: viewer123!
   ```

3. **Verify System Health**
   ```bash
   curl https://tcmanger-production.up.railway.app/health
   # Expected: {"status":"OK","timestamp":"...","uptime":...}
   ```

4. **Start Using the Platform**
   - Login with any test account above
   - Explore the dashboard interface
   - Create projects and test cases
   - Experience real-time test management

### **💻 Local Development Setup**

1. **Clone and Install**
   ```bash
   git clone https://github.com/nathanokh1/tcmanger.git
   cd TCM
   npm run install:all
   ```

2. **Environment Setup**
   ```bash
   # Copy .env template and configure
   cp .env.example .env
   # Edit .env with your local settings
   ```

3. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run server:dev  # Backend on port 3000
   npm run client:dev  # Frontend on port 3001
   ```

4. **Access Local Development**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

---

## 🔗 Access Points

### **Production Environment**
- **Main Application**: https://tcmanger-production.up.railway.app
- **Health Monitoring**: https://tcmanger-production.up.railway.app/health
- **API Endpoints**: https://tcmanger-production.up.railway.app/api/*
- **Database**: MongoDB Atlas (Cloud)

### **Local Development**
- **Frontend**: http://localhost:3001 (Next.js dev server)
- **Backend**: http://localhost:3000 (Express dev server)  
- **Database**: Can connect to local MongoDB or Atlas

---

## 🎯 **What's Available Now**

### **✅ Fully Implemented Features**
- **Authentication System**: JWT-based with role-based access control
- **Project Management**: Hierarchical organization (Project → Module → Feature → Test Case)
- **Test Case Management**: Complete CRUD with advanced filtering and search
- **Team Collaboration**: Multi-user support with role assignments
- **Real-time Dashboard**: Live status tracking and progress indicators
- **Reporting & Analytics**: Executive dashboard with trend analysis
- **Modern UI/UX**: Material-UI design with responsive mobile support
- **Production Deployment**: Scalable cloud infrastructure

### **🔄 Currently in Development (Phase 5)**
- **Real-time Collaboration**: WebSocket integration for live updates
- **Performance Optimization**: Caching and response time improvements
- **Advanced Integration**: Enhanced API functionality
- **Mobile UX Enhancements**: Improved touch interface

### **📋 Planned Features (Phase 6+)**
- **Test Automation Integration**: Playwright framework connectivity
- **AI-Powered Features**: Smart test generation and predictive analytics
- **Enterprise Integration**: JIRA, GitHub, Slack integrations
- **Advanced Security**: SSO, audit logging, compliance features

---

## System Requirements

### **For Production Use**
- ✅ **No Setup Required**: Access via web browser
- ✅ **Any Device**: Responsive design for desktop/mobile
- ✅ **Modern Browser**: Chrome, Firefox, Safari, Edge

### **For Local Development**
- **Node.js**: 18+ 
- **npm**: 9+
- **MongoDB**: 5+ (optional - can use Atlas)
- **TypeScript**: 5+ (included in dependencies)

---

## Environment Configuration

### **Production (Already Configured)**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/tcmanager
JWT_SECRET=secure-production-secret
PORT=8000  # Auto-assigned by Railway
```

### **Local Development (.env)**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tcmanager
# OR use Atlas: mongodb+srv://...@cluster.mongodb.net/tcmanager
JWT_SECRET=your-local-development-secret
PORT=3000
CLIENT_URL=http://localhost:3001
```

---

## 📊 Deployment Architecture

### **Production Architecture (Single Service)**
```
User → https://tcmanger-production.up.railway.app
       ├── / (Frontend) → Next.js Static Files
       ├── /api/* (Backend) → Express API
       └── /health → System Status
                     ↓
               MongoDB Atlas (Cloud)
```

### **Development Setup**
```
Frontend (3001) ←→ Backend (3000) ←→ MongoDB
    ↓                    ↓              ↓
Next.js Dev        Express Dev     Local/Atlas
```

---

## 🎯 Quick Verification Steps

### **Production Health Check**
```bash
# Test production deployment
curl https://tcmanger-production.up.railway.app/health

# Expected Response:
{
  "status": "OK",
  "timestamp": "2024-12-...",
  "uptime": 387.622,
  "environment": "production"
}
```

### **Feature Testing**
1. **Login**: Use any test account to access the system
2. **Dashboard**: View real-time status cards and metrics
3. **Projects**: Create and manage projects with team members
4. **Test Cases**: Create, filter, and search test cases
5. **Reports**: Explore analytics and trend visualizations

### **Local Development Check**
```bash
# Test local backend
curl http://localhost:3000/health

# Test frontend
curl http://localhost:3001
```

The API seeds these local accounts on an empty database (`tenantId` `dev`). Passwords must be at least 8 characters:

```
admin@tcmanager.com / Admin123!
developer@tcmanager.com / Dev1234!
qa@tcmanager.com / QA12345!
viewer@tcmanager.com / View123!
```

Login tokens are signed with `JWT_SECRET` or the development fallback `fallback-secret`. Protected routes read the `userId` claim from that token.

---

## 🚧 Troubleshooting

### **Production Issues**
- **App not loading**: Check Railway service status
- **Login issues**: Verify test account credentials
- **API errors**: Verify production health endpoint
- **Database issues**: Check MongoDB Atlas connection status

### **Local Development Issues**
- **Port conflicts**: Check if ports 3000/3001 are available
- **TypeScript errors**: Run `npm run build` to check compilation
- **MongoDB connection**: Verify connection string in .env
- **Dependencies**: Run `npm run install:all`

For detailed troubleshooting, refer to `docs/technical/troubleshooting.md`

---

## 🎉 Success Indicators

### **Production Ready ✅**
- ✅ Railway deployment operational
- ✅ MongoDB Atlas connected
- ✅ Health monitoring active
- ✅ SSL certificate active
- ✅ API endpoints responding
- ✅ User authentication working
- ✅ Test management functional
- ✅ Real-time features operational

### **Development Ready ✅**
- ✅ Frontend dev server running on 3001
- ✅ Backend dev server running on 3000
- ✅ Database connection established
- ✅ Hot reload working
- ✅ TypeScript compilation successful

---

## 🎯 Next Steps

### **For End Users**
1. **Access Production**: Visit https://tcmanger-production.up.railway.app
2. **Login**: Use provided test accounts or create your own
3. **Explore Features**: Dashboard, projects, test cases, reports
4. **Start Testing**: Create your first project and begin test management

### **For Developers**
1. **Local Setup**: Follow local development setup
2. **Code Changes**: Make modifications to frontend/backend
3. **Testing**: Implement and run tests
4. **Deployment**: Push to GitHub for automatic Railway deployment

### **For Stakeholders**
1. **Review Progress**: Check current 85% completion status
2. **Provide Feedback**: Test the live application and provide input
3. **Plan Features**: Review Phase 6+ roadmap for future enhancements
4. **Team Onboarding**: Set up team access and begin adoption

---

## 📚 Documentation Resources

- **User Guides**: `docs/guides/`
- **Technical Documentation**: `docs/technical/`
- **API Reference**: `docs/technical/api-docs.md`
- **Development Workflow**: `docs/guides/workflow.md`
- **Current Status**: `docs/project/CURRENT_STATUS.md`
- **Roadmap**: `docs/project/roadmap.md`
- **Feature Catalog**: `docs/project/TCManager_Feature_Catalog.md`
- **TODO & Priorities**: `docs/project/TODO_PRIORITIES.md`

---

## 🚀 **Current Development Status**

**Phase Completion:**
- ✅ Phase 1: Core Infrastructure (100%)
- ✅ Phase 2: Frontend Development (100%)
- ✅ Phase 3: Production Deployment (100%)
- ✅ Phase 4: Advanced Features (95%)
- 🔄 Phase 5: Integration & Enhancement (30%)

**Key Achievements:**
- **Production-Ready Platform**: Live and operational
- **Enterprise Features**: Role-based access, team management
- **Modern UI/UX**: Professional Material-UI design
- **Scalable Architecture**: MongoDB Atlas, Railway cloud
- **Comprehensive Testing**: Unit and integration tests
- **Security Implementation**: JWT auth, secure deployment

The TCManager platform is now a **production-ready, enterprise-grade test management solution** ready for real-world use.

---

*Updated: December 2024 - Production deployment successful with 85% feature completion* 