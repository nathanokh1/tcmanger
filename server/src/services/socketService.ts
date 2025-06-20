import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

interface TestExecutionUpdate {
  testCaseId: string;
  testRunId: string;
  status: 'running' | 'passed' | 'failed' | 'blocked' | 'skipped';
  progress?: number;
  duration?: number;
  error?: string;
  user: {
    id: string;
    name: string;
  };
}

interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string; // If specified, send only to this user
  projectId?: string; // If specified, send to project members
}

interface CollaborationUpdate {
  type: 'test-case-edit' | 'user-join' | 'user-leave' | 'comment-added';
  entityId: string; // test case ID, project ID, etc.
  userId: string;
  userName: string;
  data?: any;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private projectMembers: Map<string, Set<string>> = new Map(); // projectId -> userIds

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    logger.info('Socket.io service initialized');
  }

  private setupMiddleware(): void {
    // Authentication middleware for Socket.io
    this.io.use((socket: any, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
        
        if (!token) {
          logger.warn('Socket connection attempted without token');
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
        
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role;
        
        logger.info(`Socket authenticated: ${decoded.email} (${socket.id})`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.userEmail} (${socket.id})`);

      // Track connected users
      this.trackUser(socket.userId!, socket.id);

      // Join user to their projects
      this.joinUserProjects(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`User disconnected: ${socket.userEmail} (${socket.id}) - ${reason}`);
        this.untrackUser(socket.userId!, socket.id);
      });

      // Handle project joining
      socket.on('join-project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        this.addToProject(projectId, socket.userId!);
        logger.info(`User ${socket.userEmail} joined project ${projectId}`);
        
        // Notify other project members
        socket.to(`project:${projectId}`).emit('user-joined-project', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          projectId
        });
      });

      // Handle project leaving
      socket.on('leave-project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        this.removeFromProject(projectId, socket.userId!);
        logger.info(`User ${socket.userEmail} left project ${projectId}`);
        
        // Notify other project members
        socket.to(`project:${projectId}`).emit('user-left-project', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          projectId
        });
      });

      // Handle test case collaboration
      socket.on('test-case-editing', (data: { testCaseId: string; field: string; value: any }) => {
        socket.broadcast.emit('test-case-update', {
          testCaseId: data.testCaseId,
          field: data.field,
          value: data.value,
          userId: socket.userId,
          userEmail: socket.userEmail,
          timestamp: new Date().toISOString()
        });
      });

      // Handle test run start
      socket.on('test-run-started', (data: { testRunId: string; projectId: string }) => {
        this.broadcastToProject(data.projectId, 'test-run-started', {
          testRunId: data.testRunId,
          startedBy: {
            id: socket.userId,
            email: socket.userEmail
          },
          timestamp: new Date().toISOString()
        });
      });

      // Handle typing indicators
      socket.on('typing-start', (data: { entityId: string; entityType: string }) => {
        socket.broadcast.emit('user-typing', {
          entityId: data.entityId,
          entityType: data.entityType,
          userId: socket.userId,
          userEmail: socket.userEmail
        });
      });

      socket.on('typing-stop', (data: { entityId: string; entityType: string }) => {
        socket.broadcast.emit('user-stopped-typing', {
          entityId: data.entityId,
          entityType: data.entityType,
          userId: socket.userId
        });
      });
    });
  }

  private trackUser(userId: string, socketId: string): void {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    this.connectedUsers.get(userId)!.push(socketId);
  }

  private untrackUser(userId: string, socketId: string): void {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      const index = userSockets.indexOf(socketId);
      if (index > -1) {
        userSockets.splice(index, 1);
      }
      if (userSockets.length === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  private joinUserProjects(socket: AuthenticatedSocket): void {
    // This would typically fetch user's projects from database
    // For now, we'll implement a basic version
    // In production, you'd query the database for user's projects
  }

  private addToProject(projectId: string, userId: string): void {
    if (!this.projectMembers.has(projectId)) {
      this.projectMembers.set(projectId, new Set());
    }
    this.projectMembers.get(projectId)!.add(userId);
  }

  private removeFromProject(projectId: string, userId: string): void {
    const members = this.projectMembers.get(projectId);
    if (members) {
      members.delete(userId);
      if (members.size === 0) {
        this.projectMembers.delete(projectId);
      }
    }
  }

  // Public methods for other services to use

  /**
   * Broadcast test execution updates to all connected users in a project
   */
  public broadcastTestExecution(projectId: string, update: TestExecutionUpdate): void {
    this.io.to(`project:${projectId}`).emit('test-execution-update', {
      ...update,
      timestamp: new Date().toISOString()
    });
    
    logger.info(`Test execution update broadcasted for project ${projectId}: ${update.testCaseId} - ${update.status}`);
  }

  /**
   * Send notification to specific user or project members
   */
  public sendNotification(notification: NotificationData): void {
    if (notification.userId) {
      // Send to specific user
      this.sendToUser(notification.userId, 'notification', notification);
    } else if (notification.projectId) {
      // Send to all project members
      this.broadcastToProject(notification.projectId, 'notification', notification);
    } else {
      // Broadcast to all connected users
      this.io.emit('notification', notification);
    }
    
    logger.info(`Notification sent: ${notification.title}`);
  }

  /**
   * Broadcast collaboration updates
   */
  public broadcastCollaboration(update: CollaborationUpdate): void {
    this.io.emit('collaboration-update', {
      ...update,
      timestamp: new Date().toISOString()
    });
    
    logger.info(`Collaboration update broadcasted: ${update.type} for ${update.entityId}`);
  }

  /**
   * Send message to specific user
   */
  public sendToUser(userId: string, event: string, data: any): void {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.length > 0) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  /**
   * Broadcast message to all members of a project
   */
  public broadcastToProject(projectId: string, event: string, data: any): void {
    this.io.to(`project:${projectId}`).emit(event, data);
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get project members count
   */
  public getProjectMembersCount(projectId: string): number {
    return this.projectMembers.get(projectId)?.size || 0;
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
} 