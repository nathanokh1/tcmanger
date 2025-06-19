import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { logger } from './utils/logger';
import { seedUsers } from './utils/seedUsers';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import projectRoutes from './routes/projects';
import testCaseRoutes from './routes/testCases';
import { testRunRoutes } from './routes/testRuns';
import { userRoutes } from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 3000);

// Trust proxy for Railway deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/testruns', testRunRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the Next.js app build
if (process.env.NODE_ENV === 'production') {
  // Serve Next.js static files
  const clientBuildPath = path.join(__dirname, '../../client/.next/static');
  const clientPublicPath = path.join(__dirname, '../../client/public');
  
  // Serve Next.js static assets
  app.use('/_next/static', express.static(clientBuildPath));
  app.use('/static', express.static(clientBuildPath));
  
  // Serve public assets
  app.use(express.static(clientPublicPath));
  
  // Serve the built Next.js app
  const clientDistPath = path.join(__dirname, '../../client/out');
  
  // Try to serve Next.js static export first
  app.use(express.static(clientDistPath));
  
  // For all non-API routes, serve the Next.js app or fallback HTML
  app.get('*', (req, res) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    
    // Try to serve the built Next.js index.html
    res.sendFile(indexPath, (err) => {
      if (err) {
        // Fallback to a functional web app if Next.js build doesn't exist
        res.send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <link rel="icon" href="/favicon.ico" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="theme-color" content="#000000" />
              <title>TCManager - Test Case Management</title>
              <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
              <script src="https://unpkg.com/@mui/material@latest/umd/material-ui.production.min.js"></script>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
              <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
              <style>
                body {
                  margin: 0;
                  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                }
                .app-container {
                  padding: 20px;
                  max-width: 1200px;
                  margin: 0 auto;
                }
                .card {
                  background: white;
                  border-radius: 8px;
                  padding: 24px;
                  margin: 20px 0;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header {
                  text-align: center;
                  color: white;
                  margin-bottom: 40px;
                }
                .nav-button {
                  background: #1976d2;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  margin: 8px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 16px;
                }
                .nav-button:hover {
                  background: #1565c0;
                }
                .feature-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                  gap: 20px;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="app-container">
                <div class="header">
                  <h1>🧪 TCManager</h1>
                  <h2>Advanced Test Case Management Platform</h2>
                  <p>Full-Stack Application Running on Railway</p>
                </div>
                
                <div class="card">
                  <h3>🚀 Platform Status</h3>
                  <p><strong>Backend API:</strong> ✅ Running on Railway</p>
                  <p><strong>Database:</strong> Ready for MongoDB connection</p>
                  <p><strong>Authentication:</strong> JWT-based auth system ready</p>
                  <p><strong>Health Check:</strong> <a href="/health" target="_blank">/health</a></p>
                </div>

                <div class="card">
                  <h3>📊 Available API Endpoints</h3>
                  <ul>
                    <li><strong>Authentication:</strong> /api/auth (login, register, profile)</li>
                    <li><strong>Projects:</strong> /api/projects (CRUD operations)</li>
                    <li><strong>Test Cases:</strong> /api/testcases (full test management)</li>
                    <li><strong>Test Runs:</strong> /api/testruns (execution tracking)</li>
                    <li><strong>Users:</strong> /api/users (user management)</li>
                  </ul>
                </div>

                <div class="feature-grid">
                  <div class="card">
                    <h4>🔐 Authentication Ready</h4>
                    <p>JWT-based authentication system with role-based access control</p>
                  </div>
                  <div class="card">
                    <h4>📝 Test Case Management</h4>
                    <p>Complete test case authoring with steps, automation scripts, and approvals</p>
                  </div>
                  <div class="card">
                    <h4>🎯 Project Organization</h4>
                    <p>Hierarchical project structure: Projects → Modules → Features → Test Cases</p>
                  </div>
                  <div class="card">
                    <h4>🔗 External Integrations</h4>
                    <p>Built-in support for Jira, ServiceNow, and automation frameworks</p>
                  </div>
                </div>

                <div class="card">
                  <h3>⚡ Quick Start</h3>
                  <p>Ready to start building! The backend is fully functional and the data models are complete.</p>
                  <button class="nav-button" onclick="window.open('/health', '_blank')">Check System Health</button>
                  <button class="nav-button" onclick="testAPI()">Test API Connection</button>
                </div>
              </div>

              <script>
                async function testAPI() {
                  try {
                    const response = await fetch('/health');
                    const data = await response.json();
                    alert('API Test Successful!\\n\\n' + JSON.stringify(data, null, 2));
                  } catch (error) {
                    alert('API Test Failed: ' + error.message);
                  }
                }
              </script>
            </body>
          </html>
        `);
      }
    });
  });
} else {
  // Development mode - API only
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      note: 'In development mode - frontend should be served separately on port 3001'
    });
  });
}

// Error handling middleware
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcmanager';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected successfully');
    
    // Seed default users on startup
    await seedUsers();
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Starting graceful shutdown...');
  
  mongoose.connection.close().then(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3001'}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app; 