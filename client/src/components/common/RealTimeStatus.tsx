import React, { useState, useEffect } from 'react';
import socketService, { 
  TestExecutionUpdate, 
  NotificationData, 
  CollaborationUpdate 
} from '../../services/socketService';

interface RealTimeStatusProps {
  token?: string;
}

const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ token }) => {
  const [connected, setConnected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize socket connection if token is provided
    if (token) {
      socketService.connect(token);
    }

    // Setup event listeners
    const handleConnectionStatus = (data: { connected: boolean; reason?: string }) => {
      setConnected(data.connected);
      setConnectionInfo(data);
      addEvent('connection', `Connection ${data.connected ? 'established' : 'lost'}${data.reason ? ` (${data.reason})` : ''}`);
    };

    const handleConnectionError = (data: { error: string }) => {
      addEvent('error', `Connection error: ${data.error}`);
    };

    const handleReconnected = (data: { attemptNumber: number }) => {
      addEvent('connection', `Reconnected after ${data.attemptNumber} attempts`);
    };

    const handleTestExecution = (data: TestExecutionUpdate) => {
      addEvent('test-execution', `Test ${data.testCaseId}: ${data.status}`, data);
    };

    const handleNotification = (data: NotificationData) => {
      setNotifications(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
      setUnreadCount(prev => prev + 1);
      addEvent('notification', data.title, data);
    };

    const handleCollaboration = (data: CollaborationUpdate) => {
      addEvent('collaboration', `${data.userName} ${data.type} on ${data.entityId}`, data);
    };

    const handleUserJoinedProject = (data: any) => {
      addEvent('user-activity', `${data.userEmail} joined project ${data.projectId}`);
    };

    const handleUserLeftProject = (data: any) => {
      addEvent('user-activity', `${data.userEmail} left project ${data.projectId}`);
    };

    const handleTestRunStarted = (data: any) => {
      addEvent('test-run', `Test run ${data.testRunId} started by ${data.startedBy.email}`);
    };

    const handleTestCaseUpdate = (data: any) => {
      addEvent('test-case', `Test case ${data.testCaseId} updated by ${data.userEmail}`);
    };

    const handleUserTyping = (data: any) => {
      addEvent('typing', `${data.userEmail} is typing...`);
    };

    // Register listeners
    socketService.on('connection-status', handleConnectionStatus);
    socketService.on('connection-error', handleConnectionError);
    socketService.on('reconnected', handleReconnected);
    socketService.on('test-execution-update', handleTestExecution);
    socketService.on('notification', handleNotification);
    socketService.on('collaboration-update', handleCollaboration);
    socketService.on('user-joined-project', handleUserJoinedProject);
    socketService.on('user-left-project', handleUserLeftProject);
    socketService.on('test-run-started', handleTestRunStarted);
    socketService.on('test-case-update', handleTestCaseUpdate);
    socketService.on('user-typing', handleUserTyping);

    // Check initial connection status
    setConnected(socketService.isConnected());

    // Cleanup listeners on unmount
    return () => {
      socketService.off('connection-status', handleConnectionStatus);
      socketService.off('connection-error', handleConnectionError);
      socketService.off('reconnected', handleReconnected);
      socketService.off('test-execution-update', handleTestExecution);
      socketService.off('notification', handleNotification);
      socketService.off('collaboration-update', handleCollaboration);
      socketService.off('user-joined-project', handleUserJoinedProject);
      socketService.off('user-left-project', handleUserLeftProject);
      socketService.off('test-run-started', handleTestRunStarted);
      socketService.off('test-case-update', handleTestCaseUpdate);
      socketService.off('user-typing', handleUserTyping);
    };
  }, [token]);

  const addEvent = (type: string, message: string, data?: any) => {
    const event = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
      data
    };
    setRecentEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
  };

  const handleReconnect = () => {
    socketService.reconnect();
  };

  const clearNotifications = () => {
    setUnreadCount(0);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return '🔗';
      case 'test-execution':
        return '🧪';
      case 'notification':
        return '🔔';
      case 'user-activity':
        return '👤';
      case 'test-run':
        return '▶️';
      default:
        return '📢';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'connection':
        return connected ? '#4caf50' : '#f44336';
      case 'test-execution':
        return '#2196f3';
      case 'notification':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '16px', 
        right: '16px', 
        minWidth: '320px',
        maxWidth: '400px',
        zIndex: 1300,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid #e0e0e0' : 'none'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '20px' }}>
              {connected ? '🟢' : '🔴'}
            </span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#f44336',
                color: 'white',
                borderRadius: '50%',
                fontSize: '10px',
                padding: '2px 4px',
                minWidth: '16px',
                textAlign: 'center'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
            Real-time Status
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: connected ? '#e8f5e8' : '#ffebee',
            color: connected ? '#2e7d2e' : '#c62828',
            border: `1px solid ${connected ? '#4caf50' : '#f44336'}`
          }}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          {!connected && (
            <button 
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px'
              }}
              onClick={(e) => { e.stopPropagation(); handleReconnect(); }}
              title="Reconnect"
            >
              🔄
            </button>
          )}
          <span style={{ fontSize: '16px' }}>
            {expanded ? '🔼' : '🔽'}
          </span>
        </div>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <>
          {/* Connection Info */}
          {connectionInfo && (
            <div style={{ padding: '12px 16px', backgroundColor: '#f5f5f5', fontSize: '12px', color: '#666' }}>
              Socket ID: {socketService.getConnectionStatus().socketId || 'Not connected'}
            </div>
          )}

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <>
              <div style={{ padding: '16px', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    Recent Notifications
                  </span>
                  <button 
                    style={{
                      background: 'none',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={clearNotifications}
                  >
                    Clear
                  </button>
                </div>
                <div style={{ maxHeight: '120px', overflow: 'auto' }}>
                  {notifications.slice(0, 3).map((notif, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px', 
                      padding: '4px 0',
                      borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span style={{ fontSize: '16px' }}>🔔</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{notif.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{notif.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e0e0e0' }}></div>
            </>
          )}

          {/* Recent Events */}
          <div style={{ padding: '16px', paddingTop: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
              Live Activity Feed
            </div>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div key={event.id} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px', 
                    padding: '4px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontSize: '16px' }}>
                      {getEventIcon(event.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px' }}>{event.message}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {event.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#666', fontSize: '13px', padding: '20px' }}>
                  <div>No recent activity</div>
                  <div style={{ fontSize: '12px' }}>Waiting for real-time events...</div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            height: '1px', 
            backgroundColor: '#e0e0e0' 
          }}></div>
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f5f5f5', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '12px',
            color: '#666'
          }}>
            <span>Socket.io v4.x</span>
            <span>{recentEvents.length} events</span>
          </div>
        </>
      )}
    </div>
  );
};

export default RealTimeStatus; 