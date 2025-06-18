# TCManager Startup Guide

## 🎉 **Production Ready!**

**🌐 Live Application**: https://tcmanger-production.up.railway.app  
**Status**: ✅ Fully deployed and operational  
**Architecture**: Option C - Single Service Deployment  

---

## Quick Start Options

### **🚀 Use Production Instance (Recommended)**
1. **Access the Live Application**
   ```
   URL: https://tcmanger-production.up.railway.app
   ```

2. **Verify System Health**
   ```bash
   curl https://tcmanger-production.up.railway.app/health
   # Expected: {"status":"OK","timestamp":"...","uptime":...}
   ```

3. **Start Using the Platform**
   - Create your user account
   - Begin managing test cases
   - Explore the dashboard interface

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

### **Option C: Single Service (Production)**
```
User → https://tcmanger-production.up.railway.app
       ├── / (Frontend) → React Static Files
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
  "timestamp": "2025-06-18T...",
  "uptime": 387.622,
  "environment": "production"
}
```

### **Local Development Check**
```bash
# Test local backend
curl http://localhost:3000/health

# Test frontend
curl http://localhost:3001
```

---

## 🚧 Troubleshooting

### **Production Issues**
- **App not loading**: Check Railway service status
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
2. **Create Account**: Register and verify your account
3. **Explore Features**: Dashboard, projects, test cases
4. **Start Testing**: Create your first project and test cases

### **For Developers**
1. **Local Setup**: Follow local development setup
2. **Code Changes**: Make modifications to frontend/backend
3. **Testing**: Implement and run tests
4. **Deployment**: Push to GitHub for automatic Railway deployment

---

## 📚 Documentation Resources

- **User Guides**: `docs/guides/`
- **Technical Documentation**: `docs/technical/`
- **API Reference**: `docs/technical/api-docs.md`
- **Development Workflow**: `docs/guides/workflow.md`
- **Deployment Details**: `docs/technical/DEPLOYMENT_SUCCESS.md`

---

*Updated: 2025-06-18 - Production deployment successful with Option C architecture* 