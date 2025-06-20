import { io, Socket } from 'socket.io-client';

export interface TestExecutionUpdate {
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
  timestamp: string;
}

export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  projectId?: string;
}

export interface CollaborationUpdate {
  type: 'test-case-edit' | 'user-join' | 'user-leave' | 'comment-added';
  entityId: string;
  userId: string;
  userName: string;
  data?: any;
  timestamp: string;
}

export interface UserTypingData {
  entityId: string;
  entityType: string;
  userId: string;
  userEmail: string;
}

class ClientSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private connected: boolean = false;
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Initialize Socket.io connection
   */
  public connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.token = token;
    
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? 'https://tcmanger-production.up.railway.app'
      : 'http://localhost:3000';

    console.log(`Connecting to Socket.io server: ${serverUrl}`);

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect from Socket.io server
   */
  public disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting from Socket.io server');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Socket.io server:', this.socket?.id);
      this.connected = true;
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.io server:', reason);
      this.connected = false;
      this.emit('connection-status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      this.emit('connection-error', { error: error.message });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.io server. Attempt:', attemptNumber);
      this.connected = true;
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket.io reconnection error:', error);
      this.emit('reconnection-error', { error: error.message });
    });

    // Handle server events
    this.socket.on('test-execution-update', (data: TestExecutionUpdate) => {
      console.log('Test execution update:', data);
      this.emit('test-execution-update', data);
    });

    this.socket.on('notification', (data: NotificationData) => {
      console.log('Notification received:', data);
      this.emit('notification', data);
    });

    this.socket.on('collaboration-update', (data: CollaborationUpdate) => {
      console.log('Collaboration update:', data);
      this.emit('collaboration-update', data);
    });

    this.socket.on('test-case-update', (data: any) => {
      console.log('Test case update:', data);
      this.emit('test-case-update', data);
    });

    this.socket.on('user-typing', (data: UserTypingData) => {
      this.emit('user-typing', data);
    });

    this.socket.on('user-stopped-typing', (data: { entityId: string; entityType: string; userId: string }) => {
      this.emit('user-stopped-typing', data);
    });

    this.socket.on('user-joined-project', (data: any) => {
      console.log('User joined project:', data);
      this.emit('user-joined-project', data);
    });

    this.socket.on('user-left-project', (data: any) => {
      console.log('User left project:', data);
      this.emit('user-left-project', data);
    });

    this.socket.on('test-run-started', (data: any) => {
      console.log('Test run started:', data);
      this.emit('test-run-started', data);
    });
  }

  /**
   * Join a project room for receiving project-specific updates
   */
  public joinProject(projectId: string): void {
    if (this.socket?.connected) {
      console.log(`Joining project: ${projectId}`);
      this.socket.emit('join-project', projectId);
    } else {
      console.warn('Cannot join project - socket not connected');
    }
  }

  /**
   * Leave a project room
   */
  public leaveProject(projectId: string): void {
    if (this.socket?.connected) {
      console.log(`Leaving project: ${projectId}`);
      this.socket.emit('leave-project', projectId);
    }
  }

  /**
   * Send test case editing event
   */
  public sendTestCaseEdit(testCaseId: string, field: string, value: any): void {
    if (this.socket?.connected) {
      this.socket.emit('test-case-editing', {
        testCaseId,
        field,
        value
      });
    }
  }

  /**
   * Send test run started event
   */
  public sendTestRunStarted(testRunId: string, projectId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('test-run-started', {
        testRunId,
        projectId
      });
    }
  }

  /**
   * Send typing start event
   */
  public sendTypingStart(entityId: string, entityType: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-start', {
        entityId,
        entityType
      });
    }
  }

  /**
   * Send typing stop event
   */
  public sendTypingStop(entityId: string, entityType: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-stop', {
        entityId,
        entityType
      });
    }
  }

  /**
   * Subscribe to events
   */
  public on(eventName: string, callback: Function): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(callback);
  }

  /**
   * Unsubscribe from events
   */
  public off(eventName: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(eventName);
      return;
    }

    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit events to local listeners
   */
  private emit(eventName: string, data?: any): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): { connected: boolean; socketId?: string } {
    return {
      connected: this.connected,
      socketId: this.socket?.id
    };
  }

  /**
   * Manually reconnect
   */
  public reconnect(): void {
    if (this.socket) {
      console.log('Manually reconnecting to Socket.io server');
      this.socket.connect();
    } else if (this.token) {
      console.log('Reconnecting with stored token');
      this.connect(this.token);
    } else {
      console.warn('Cannot reconnect - no token available');
    }
  }
}

// Create singleton instance
const socketService = new ClientSocketService();

export default socketService; 