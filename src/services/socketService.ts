import { io, Socket } from 'socket.io-client';
import { getStoredToken } from './authApi';

const SOCKET_BASE_URL = 'https://todaymall.co.kr';

export interface SocketMessage {
  _id: string;
  senderType: 'user' | 'admin';
  senderId: string;
  senderName?: string;
  message: string;
  timestamp: string;
  readBy: string[];
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    name?: string;
  }>;
}

export interface GeneralInquiry {
  _id: string;
  subject?: string;
  category?: 'general' | 'support' | 'complaint' | 'suggestion' | 'technical';
  status: 'open' | 'closed' | 'resolved';
  messages: SocketMessage[];
  order?: {
    _id: string;
    orderNumber: string;
  };
  assignedAdmin?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  lastMessageAt?: string;
  messageCount?: number;
  unreadCount?: number;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Connect to Socket.IO server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('Socket already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('Socket connection already in progress');
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.socket = io(SOCKET_BASE_URL, {
          path: '/api/socket.io',
          auth: {
            token: token,
          },
          transports: ['polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
          console.log('✅ Socket connected:', this.socket?.id);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          this.isConnecting = false;
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Failed to connect to server after multiple attempts'));
          } else {
            // Will auto-reconnect
            resolve();
          }
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Socket disconnected:', reason);
          this.isConnecting = false;
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('❌ Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Socket reconnection failed after max attempts');
        });
      } catch (error) {
        console.error('❌ Error creating socket connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected. Cannot emit event:', event);
    }
  }

  /**
   * Listen to an event
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event: string): void {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }

  // ========== Inquiry Socket Methods ==========

  /**
   * Send a message via socket
   */
  sendMessage(inquiryId: string, message: string, attachments?: any[]): void {
    this.emit('user:inquiry:send-message', {
      inquiryId,
      message,
      attachments: attachments || [],
    });
  }

  /**
   * Subscribe to an inquiry for real-time updates
   */
  subscribeToInquiry(inquiryId: string): void {
    this.emit('user:inquiry:subscribe', { inquiryId });
  }

  /**
   * Unsubscribe from an inquiry
   */
  unsubscribeFromInquiry(inquiryId: string): void {
    this.emit('user:inquiry:unsubscribe', { inquiryId });
  }

  /**
   * Get unread counts by inquiry (alternative to REST)
   */
  getUnreadCounts(): void {
    this.emit('user:inquiry:unread-counts');
  }
}

// Export singleton instance
export const socketService = new SocketService();

