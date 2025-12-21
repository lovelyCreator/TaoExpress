import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { socketService, GeneralInquiry, SocketMessage } from '../services/socketService';
import { useAuth } from './AuthContext';
import { getStoredToken } from '../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  // Socket methods (real-time only - use REST API for create/send/list/get/mark-read/close)
  subscribeToInquiry: (inquiryId: string) => void;
  unsubscribeFromInquiry: (inquiryId: string) => void;
  getUnreadCounts: () => void;
  // State
  inquiries: GeneralInquiry[];
  currentInquiry: GeneralInquiry | null;
  unreadCount: number;
  // Event handlers
  onInquiryCreated: (callback: (inquiry: GeneralInquiry) => void) => void;
  onMessageReceived: (callback: (data: { message: SocketMessage; inquiryId: string; unreadCount?: number; totalUnreadCount?: number }) => void) => void;
  onInquiryUpdated: (callback: (inquiry: GeneralInquiry) => void) => void;
  onInquiryClosed: (callback: (inquiryId: string) => void) => void;
  onMessagesRead: (callback: (data: { inquiryId: string; readBy: string; readByType: string; readByName: string; readAt: string }) => void) => void;
  onUnreadCountUpdated: (callback: (count: number) => void) => void;
  // Remove listeners
  removeListeners: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inquiries, setInquiries] = useState<GeneralInquiry[]>([]);
  const [currentInquiry, setCurrentInquiry] = useState<GeneralInquiry | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Callback refs for event handlers
  const onInquiryCreatedCallbackRef = React.useRef<((inquiry: GeneralInquiry) => void) | null>(null);
  const onMessageReceivedCallbackRef = React.useRef<((data: { message: SocketMessage; inquiryId: string; unreadCount?: number; totalUnreadCount?: number }) => void) | null>(null);
  const onInquiryUpdatedCallbackRef = React.useRef<((inquiry: GeneralInquiry) => void) | null>(null);
  const onInquiryClosedCallbackRef = React.useRef<((inquiryId: string) => void) | null>(null);
  const onUnreadCountUpdatedCallbackRef = React.useRef<((count: number) => void) | null>(null);
  const onMessagesReadCallbackRef = React.useRef<((data: { inquiryId: string; readBy: string; readByType: string; readByName: string; readAt: string }) => void) | null>(null);

  // Connect socket when authenticated
  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, skipping socket connection');
      return;
    }

    if (socketService.isConnected()) {
      console.log('Socket already connected');
      setIsConnected(true);
      return;
    }

    if (isConnecting) {
      console.log('Socket connection already in progress');
      return;
    }

    try {
      setIsConnecting(true);
      const token = await getStoredToken();
      
      if (!token) {
        console.warn('No token available for socket connection');
        setIsConnecting(false);
        return;
      }

      await socketService.connect(token);
      setIsConnected(true);
      setIsConnecting(false);

      // Set up event listeners
      setupEventListeners();
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [isAuthenticated, user]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setInquiries([]);
    setCurrentInquiry(null);
    setUnreadCount(0);
  }, []);

  // Set up event listeners
  const setupEventListeners = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Connection status
    socket.on('connect', () => {
      console.log('Socket connected in context');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected in context');
      setIsConnected(false);
    });

    // Socket Events - Real-time updates (Server → Client)
    // Note: Create, send, list, get, mark-read, close should use REST API

    // Subscribe/Unsubscribe success
    socket.on('user:inquiry:subscribe:success', (data: { inquiryId: string; message: string }) => {
      console.log('Subscribed to inquiry:', data.inquiryId);
    });

    socket.on('user:inquiry:unsubscribe:success', (data: { inquiryId: string; message: string }) => {
      console.log('Unsubscribed from inquiry:', data.inquiryId);
    });

    // Unread counts response
    socket.on('user:inquiry:unread-counts:response', (data: { totalUnread: number; inquiries: Array<{ inquiryId: string; unreadCount: number }> }) => {
      console.log('Unread counts:', data);
      setUnreadCount(data.totalUnread);
      if (onUnreadCountUpdatedCallbackRef.current) {
        onUnreadCountUpdatedCallbackRef.current(data.totalUnread);
      }
    });

    // Real-time events - User receives from server
    socket.on('user:inquiry:message:received', (data: { 
      message: SocketMessage; 
      inquiryId: string; 
      unreadCount?: number; 
      totalUnreadCount?: number;
    }) => {
      console.log('🔔 SocketContext: user:inquiry:message:received event fired!', {
        inquiryId: data.inquiryId,
        messageId: data.message?._id,
        messageText: data.message?.message || 'N/A',
        senderType: data.message?.senderType,
        unreadCount: data.unreadCount,
        totalUnreadCount: data.totalUnreadCount,
        fullData: JSON.stringify(data, null, 2),
      });
      
      if (data.totalUnreadCount !== undefined) {
        console.log(`📊 SocketContext: Updating total unread count to ${data.totalUnreadCount}`);
        setUnreadCount(data.totalUnreadCount);
      }
      
      // Save unread count for this inquiry to AsyncStorage (even when BuyListScreen is not open)
      if (data.inquiryId && data.unreadCount !== undefined) {
        AsyncStorage.getItem(STORAGE_KEYS.INQUIRY_UNREAD_COUNTS)
          .then((savedData) => {
            const savedCounts: { [inquiryId: string]: number } = savedData ? JSON.parse(savedData) : {};
            savedCounts[data.inquiryId] = data.unreadCount!;
            return AsyncStorage.setItem(STORAGE_KEYS.INQUIRY_UNREAD_COUNTS, JSON.stringify(savedCounts));
          })
          .then(() => {
            console.log(`💾 SocketContext: Saved unread count for inquiry ${data.inquiryId} to AsyncStorage`);
          })
          .catch((error) => {
            console.error('SocketContext: Failed to save unread count:', error);
          });
      }
      
      if (onMessageReceivedCallbackRef.current) {
        console.log('✅ SocketContext: Calling onMessageReceived callback');
        onMessageReceivedCallbackRef.current({
          message: data.message,
          inquiryId: data.inquiryId,
          unreadCount: data.unreadCount,
          totalUnreadCount: data.totalUnreadCount,
        });
      } else {
        console.warn('⚠️ SocketContext: No onMessageReceived callback registered');
      }
    });

    socket.on('user:inquiry:messages-read', (data: { 
      inquiryId: string; 
      readBy: string; 
      readByType: string; 
      readByName: string; 
      readAt: string;
    }) => {
      console.log('Admin read your messages:', data);
      if (onMessagesReadCallbackRef.current) {
        onMessagesReadCallbackRef.current(data);
      }
    });

    socket.on('user:inquiry:new', (data: { inquiry: GeneralInquiry }) => {
      console.log('New inquiry created by admin:', data.inquiry);
      setInquiries(prev => [data.inquiry, ...prev]);
      if (onInquiryCreatedCallbackRef.current) {
        onInquiryCreatedCallbackRef.current(data.inquiry);
      }
    });

    socket.on('user:inquiry:closed', (data: { inquiryId: string; status: string }) => {
      console.log('Inquiry closed:', data.inquiryId);
      setInquiries(prev => 
        prev.map(inq => inq._id === data.inquiryId ? { ...inq, status: 'closed' as const } : inq)
      );
      if (onInquiryClosedCallbackRef.current) {
        onInquiryClosedCallbackRef.current(data.inquiryId);
      }
    });

    socket.on('user:inquiry:reopened', (data: { inquiryId: string; status: string }) => {
      console.log('Inquiry reopened:', data.inquiryId);
      setInquiries(prev => 
        prev.map(inq => inq._id === data.inquiryId ? { ...inq, status: 'open' as const } : inq)
      );
    });

    socket.on('inquiry:admin-assigned', (data: { 
      inquiryId: string; 
      assignedAdmin: { _id: string; name: string };
    }) => {
      console.log('Admin assigned to inquiry:', data);
      setInquiries(prev => 
        prev.map(inq => inq._id === data.inquiryId ? { ...inq, assignedAdmin: data.assignedAdmin } : inq)
      );
    });
  }, []);

  // Remove all listeners
  const removeListeners = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.removeAllListeners('connect');
    socket.removeAllListeners('disconnect');
    socket.removeAllListeners('user:inquiry:subscribe:success');
    socket.removeAllListeners('user:inquiry:unsubscribe:success');
    socket.removeAllListeners('user:inquiry:unread-counts:response');
    socket.removeAllListeners('user:inquiry:message:received');
    socket.removeAllListeners('user:inquiry:messages-read');
    socket.removeAllListeners('user:inquiry:new');
    socket.removeAllListeners('user:inquiry:closed');
    socket.removeAllListeners('user:inquiry:reopened');
    socket.removeAllListeners('inquiry:admin-assigned');
  }, []);

  // Connect on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      if (!isAuthenticated) {
        disconnect();
        removeListeners();
      }
    };
  }, [isAuthenticated, user, connect, disconnect, removeListeners]);

  // Socket methods (real-time only - use REST API for create/send/list/get/mark-read/close)
  const subscribeToInquiry = useCallback((inquiryId: string) => {
    socketService.subscribeToInquiry(inquiryId);
  }, []);

  const unsubscribeFromInquiry = useCallback((inquiryId: string) => {
    socketService.unsubscribeFromInquiry(inquiryId);
  }, []);

  const getUnreadCounts = useCallback(() => {
    socketService.getUnreadCounts();
  }, []);

  // Event handler registration (for custom callbacks)
  const onInquiryCreated = useCallback((callback: (inquiry: GeneralInquiry) => void) => {
    onInquiryCreatedCallbackRef.current = callback;
  }, []);

  const onMessageReceived = useCallback((callback: (data: { message: SocketMessage; inquiryId: string; unreadCount?: number; totalUnreadCount?: number }) => void) => {
    onMessageReceivedCallbackRef.current = callback;
  }, []);

  const onInquiryUpdated = useCallback((callback: (inquiry: GeneralInquiry) => void) => {
    onInquiryUpdatedCallbackRef.current = callback;
  }, []);

  const onInquiryClosed = useCallback((callback: (inquiryId: string) => void) => {
    onInquiryClosedCallbackRef.current = callback;
  }, []);

  const onMessagesRead = useCallback((callback: (data: { inquiryId: string; readBy: string; readByType: string; readByName: string; readAt: string }) => void) => {
    onMessagesReadCallbackRef.current = callback;
  }, []);

  const onUnreadCountUpdated = useCallback((callback: (count: number) => void) => {
    onUnreadCountUpdatedCallbackRef.current = callback;
  }, []);

  const value: SocketContextType = {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    subscribeToInquiry,
    unsubscribeFromInquiry,
    getUnreadCounts,
    inquiries,
    currentInquiry,
    unreadCount,
    onInquiryCreated,
    onMessageReceived,
    onInquiryUpdated,
    onInquiryClosed,
    onMessagesRead,
    onUnreadCountUpdated,
    removeListeners,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

