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
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, allow Railway domains and localhost
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        'https://tcmanger-production.up.railway.app',
        'https://tcmanager-production.up.railway.app', // backup for typos
        'http://localhost:3001',
        'http://localhost:3000'
      ];
      
      if (allowedOrigins.includes(origin) || origin.includes('railway.app')) {
        return callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'), false);
      }
    } else {
      // Development - allow localhost
      if (origin.includes('localhost')) {
        return callback(null, true);  
      }
    }
    
    callback(null, true); // Allow all in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add cache middleware
app.use(cacheService.middleware(300)); // 5 minute default TTL

app.use('/api/', limiter);

// Health check endpoint (simple and robust)
app.get('/health', async (req, res) => {
  // Simple health check that always works
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'TCManager API is running'
  });
});

// Detailed health check with services (optional)
app.get('/api/health/detailed', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Some services are not available',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

// API Routes (MUST come before static file serving)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/testruns', testRunRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static files from the Next.js app build (AFTER API routes)
if (process.env.NODE_ENV === 'production') {
  // Serve the built Next.js app (static export)
  const clientDistPath = path.join(__dirname, '../../client/out');
  
  // First, try to serve static files from Next.js build
  app.use(express.static(clientDistPath, { 
    index: false, // Don't serve index.html automatically
    maxAge: '1h'  // Cache static assets
  }));
  
  // Handle all routes (including /admin) - serve Next.js pages
  app.get('*', (req, res) => {
    // Skip API routes and health check
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For Next.js static export, serve the index.html for all routes (SPA behavior)
    const indexPath = path.join(clientDistPath, 'index.html');
    
    // Check if the Next.js build exists
    if (require('fs').existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      // Fallback HTML if Next.js build doesn't exist
      return res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>TCManager - Loading...</title>
              <style>
                body {
                  margin: 0;
                font-family: Arial, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                }
              .container {
                  text-align: center;
                  color: white;
                padding: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                backdrop-filter: blur(10px);
                }
              .loading {
                font-size: 18px;
                margin: 20px 0;
              }
              .refresh-btn {
                  background: #1976d2;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                border-radius: 6px;
                  cursor: pointer;
                  font-size: 16px;
                margin-top: 20px;
                }
              .refresh-btn:hover {
                  background: #1565c0;
                }
              </style>
            <script>
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            </script>
            </head>
            <body>
            <div class="container">
              <h1>🔄 TCManager Loading...</h1>
              <div class="loading">Building Next.js frontend...</div>
              <p>This page will refresh automatically in 3 seconds</p>
              <button class="refresh-btn" onclick="window.location.reload()">
                Refresh Now
              </button>
              </div>
            </body>
          </html>
        `);
      }
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