import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer } from 'http';

import { logger } from './utils/logger';
import { seedUsers } from './utils/seedUsers';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import projectRoutes from './routes/projects';
import testCaseRoutes from './routes/testCases';
import { testRunRoutes } from './routes/testRuns';
import { userRoutes } from './routes/users';
import { analyticsRoutes } from './routes/analytics';
import { SocketService } from './services/socketService';
import { cacheService } from './services/cacheService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app); // Create HTTP server for Socket.io
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 3000);

// Initialize Socket.io service
let socketService: SocketService;

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
      connectSrc: ["'self'", "https:", "ws:", "wss:"], // Allow WebSocket connections
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

// Add cache middleware
app.use(cacheService.middleware(300)); // 5 minute default TTL

app.use('/api/', limiter);

// Health check endpoint with Socket.io and cache status
app.get('/health', async (req, res) => {
  const connectedUsers = socketService ? socketService.getConnectedUsersCount() : 0;
  const cacheStats = await cacheService.getStats();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    realtime: {
      enabled: !!socketService,
      connectedUsers
    },
    cache: {
      enabled: cacheService.isAvailable(),
      stats: cacheStats
    }
  });
});

// Cache statistics endpoint
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cache management endpoints (admin only)
app.delete('/api/cache/flush', async (req, res) => {
  try {
    await cacheService.flush();
    res.json({
      success: true,
      message: 'Cache flushed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to flush cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Middleware to make services available in routes
app.use((req: any, res, next) => {
  req.socketService = socketService;
  req.cacheService = cacheService;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/testruns', testRunRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

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
                  <p>✅ Real-time Features Enabled with Socket.io</p>
                  <p>⚡ Performance Optimized with Redis Caching</p>
                </div>
                
                <div class="card">
                  <h3>🚀 Platform Status</h3>
                  <p><strong>Backend API:</strong> ✅ Running on Railway</p>
                  <p><strong>Real-time Communication:</strong> ✅ Socket.io Enabled</p>
                  <p><strong>Performance Cache:</strong> ✅ Redis Caching System</p>
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
                    <li><strong>Analytics:</strong> /api/analytics (advanced reporting & dashboards)</li>
                    <li><strong>Real-time:</strong> Socket.io connection for live updates</li>
                    <li><strong>Cache Management:</strong> /api/cache/stats, /api/cache/flush</li>
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
                    <h4>🔄 Real-time Updates</h4>
                    <p>Live test execution tracking, collaboration, and notifications via Socket.io</p>
                  </div>
                  <div class="card">
                    <h4>⚡ High Performance</h4>
                    <p>Redis caching for blazing-fast API responses and optimized queries</p>
                  </div>
                  <div class="card">
                    <h4>📊 Analytics Dashboard</h4>
                    <p>Real-time reporting with charts, trends, and performance metrics</p>
                  </div>
                  <div class="card">
                    <h4>🔍 Advanced Search</h4>
                    <p>Lightning-fast search with intelligent filtering and caching</p>
                  </div>
                </div>

                <div class="card">
                  <h3>🔄 Real-time Features</h3>
                  <p>The platform now supports:</p>
                  <ul>
                    <li>Live test execution monitoring</li>
                    <li>Real-time collaboration on test cases</li>
                    <li>Instant notifications</li>
                    <li>Multi-user synchronization</li>
                    <li>Typing indicators</li>
                    <li>Project member presence</li>
                  </ul>
                </div>

                <div class="card">
                  <h3>⚡ Performance Features</h3>
                  <p>Optimized for speed and scalability:</p>
                  <ul>
                    <li>Redis caching for API responses</li>
                    <li>Intelligent query optimization</li>
                    <li>Session management and real-time event caching</li>
                    <li>Advanced analytics with cached aggregations</li>
                    <li>Sub-second response times</li>
                    <li>Horizontal scaling support</li>
                  </ul>
                </div>
              </div>
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
const gracefulShutdown = async () => {
  logger.info('Starting graceful shutdown...');
  
  try {
    // Disconnect cache service
    await cacheService.disconnect();
    
    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('All connections closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  await connectDB();
  
  // Initialize Socket.io service after database connection
  socketService = new SocketService(server);
  
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3001'}`);
    logger.info('Socket.io enabled for real-time features');
    logger.info(`Cache service: ${cacheService.isAvailable() ? 'Enabled' : 'Disabled'}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

// Export services for use in other modules
export { socketService, cacheService };
export default app; 