# TCManager - Test Case Management Platform

## 🎉 **Production Ready!**

**🌐 Live Application**: [https://tcmanger-production.up.railway.app](https://tcmanger-production.up.railway.app)  
**📊 Status**: 85% Complete - Enterprise-grade test management platform  
**🚀 Current Phase**: Phase 5 - Advanced Integration & Enhancement  

---

## 🎯 **Overview**

TCManager is a modern, comprehensive test case management platform that combines the best features of TestRail, Jira Test Manager, and ServiceNow. Built with enterprise-grade scalability and modern UI/UX design, it provides teams with powerful tools for managing their entire testing lifecycle.

### **🌟 Key Features**

- **🔐 Secure Authentication**: JWT-based authentication with role-based access control
- **📊 Project Management**: Hierarchical organization (Project → Module → Feature → Test Case)
- **✅ Test Case Management**: Complete CRUD operations with advanced filtering and search
- **👥 Team Collaboration**: Multi-user support with role assignments and team management
- **📈 Real-time Analytics**: Executive dashboard with live status tracking and trend analysis
- **📱 Modern UI/UX**: Responsive Material-UI design with futuristic gradient themes
- **⚡ Performance Optimized**: Sub-2s response times with scalable cloud architecture

---

## 🚀 **Quick Start**

### **Try the Live Application**

Visit [https://tcmanger-production.up.railway.app](https://tcmanger-production.up.railway.app) and login with:

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

### **Local Development Setup**

```bash
# Clone the repository
git clone https://github.com/nathanokh1/tcmanger.git
cd TCM

# Install dependencies
npm run install:all

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Start development servers
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

---

## 🏗️ **Architecture**

### **Technology Stack**

**Frontend:**
- Next.js 14 with App Router
- TypeScript
- Material-UI v5
- Redux Toolkit
- Responsive design

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Express Validator

**Infrastructure:**
- Railway (Production Deployment)
- MongoDB Atlas (Cloud Database)
- SSL/TLS Security
- Health Monitoring

### **Project Structure**

```
TCM/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/     # Next.js App Router pages
│   │   ├── components/  # Reusable UI components
│   │   └── store/   # Redux state management
├── server/          # Express.js backend API
│   ├── src/
│   │   ├── controllers/  # API request handlers
│   │   ├── models/      # MongoDB data models
│   │   ├── routes/      # API route definitions
│   │   └── middleware/  # Authentication & validation
├── docs/            # Comprehensive documentation
└── fixscripts/      # Development and deployment scripts
```

---

## ✅ **Implemented Features**

### **Core Functionality**
- ✅ **Authentication System**: JWT-based with role-based access control
- ✅ **User Management**: Profile management, role assignment, team collaboration
- ✅ **Project Management**: Hierarchical project organization with team assignments
- ✅ **Test Case Management**: Complete CRUD with advanced filtering, search, and bulk operations
- ✅ **Test Execution**: Real-time progress tracking and execution history
- ✅ **Reporting & Analytics**: Executive dashboard with trend analysis and data visualization

### **User Interface**
- ✅ **Modern Design**: Material-UI with futuristic gradient themes (#667eea to #764ba2)
- ✅ **Responsive Layout**: Mobile-first design with desktop optimization
- ✅ **Dashboard**: Real-time status cards, progress indicators, and activity feeds
- ✅ **Navigation**: Sidebar navigation with active states and protected routes
- ✅ **Interactive Elements**: Hover effects, animations, and micro-interactions

### **Technical Infrastructure**
- ✅ **RESTful API**: 20+ endpoints with comprehensive validation
- ✅ **Database Schema**: 6 optimized data models with proper indexing
- ✅ **Error Handling**: Comprehensive error management and logging
- ✅ **Health Monitoring**: System health checks and performance tracking
- ✅ **Testing**: Unit and integration tests with Jest

---

## 🔄 **In Progress (Phase 5)**

- **Real-time Collaboration**: WebSocket integration for live updates
- **Performance Optimization**: Caching implementation and response time improvements
- **Advanced Integration**: Enhanced API functionality and data synchronization
- **Mobile UX**: Improved touch interface and mobile-specific features

---

## 📋 **Planned Features (Phase 6+)**

- **Test Automation Integration**: Playwright framework connectivity
- **AI-Powered Features**: Smart test generation and predictive analytics
- **Enterprise Integration**: JIRA, GitHub, Slack integrations
- **Advanced Security**: SSO, audit logging, compliance features

---

## 📊 **Current Status**

| Category | Implementation | Production Ready | Performance Optimized |
|----------|----------------|------------------|----------------------|
| **Authentication** | ✅ 100% | ✅ Yes | ✅ Yes |
| **User Management** | ✅ 95% | ✅ Yes | ✅ Yes |
| **Test Management** | ✅ 90% | ✅ Yes | ✅ Yes |
| **Project Management** | ✅ 85% | ✅ Yes | ✅ Yes |
| **Reporting** | ✅ 80% | ✅ Yes | 🔄 Optimizing |
| **Real-time Features** | 🔄 40% | 🔄 Partial | 🔄 In Progress |

---

## 🛠️ **Development**

### **Available Scripts**

```bash
# Development
npm run dev              # Start both frontend and backend
npm run server:dev       # Start backend only
npm run client:dev       # Start frontend only

# Building
npm run build           # Build both applications
npm run server:build    # Build backend only
npm run client:build    # Build frontend only

# Testing
npm test               # Run all tests
npm run server:test    # Run backend tests
npm run client:test    # Run frontend tests

# Utilities
npm run install:all    # Install all dependencies
npm run health         # Check application health
```

### **Environment Variables**

```env
# Development (.env)
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tcmanager
JWT_SECRET=your-development-secret
PORT=3000
CLIENT_URL=http://localhost:3001

# Production (Railway)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/tcmanager
JWT_SECRET=secure-production-secret
PORT=8000
```

---

## 🎯 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### **Projects**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### **Test Cases**
- `GET /api/test-cases` - List test cases
- `POST /api/test-cases` - Create test case
- `GET /api/test-cases/:id` - Get test case details
- `PUT /api/test-cases/:id` - Update test case
- `DELETE /api/test-cases/:id` - Delete test case

**Full API documentation**: [docs/technical/api-docs.md](docs/technical/api-docs.md)

---

## 📚 **Documentation**

- **📖 User Guides**: [docs/guides/](docs/guides/)
- **🔧 Technical Docs**: [docs/technical/](docs/technical/)
- **📊 Current Status**: [docs/project/CURRENT_STATUS.md](docs/project/CURRENT_STATUS.md)
- **🗺️ Roadmap**: [docs/project/roadmap.md](docs/project/roadmap.md)
- **📋 TODO List**: [docs/project/TODO_PRIORITIES.md](docs/project/TODO_PRIORITIES.md)
- **🚀 Startup Guide**: [docs/startup_guide.md](docs/startup_guide.md)

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [docs/guides/workflow.md](docs/guides/workflow.md) for detailed development guidelines.

---

## 🏆 **Key Achievements**

- **🌐 Production Deployment**: Live and operational on Railway
- **👥 Team Collaboration**: Multi-user support with role-based permissions
- **📊 Real-time Dashboard**: Live status tracking and analytics
- **🎨 Modern UI/UX**: Professional Material-UI design system
- **⚡ Performance**: Sub-2s response times with optimized queries
- **🔒 Security**: JWT authentication with secure deployment
- **📱 Mobile Ready**: Responsive design for all devices
- **🧪 Quality Assured**: Comprehensive testing and validation

---

## 📞 **Support**

- **📧 Issues**: [GitHub Issues](https://github.com/nathanokh1/tcmanger/issues)
- **📚 Documentation**: [docs/](docs/)
- **🚀 Live Demo**: [https://tcmanger-production.up.railway.app](https://tcmanger-production.up.railway.app)

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- Built with modern web technologies for enterprise-grade performance
- Inspired by industry-leading test management tools
- Designed for teams who value quality, collaboration, and efficiency

---

**🎯 Ready to transform your testing workflow? [Try TCManager now!](https://tcmanger-production.up.railway.app)** 