import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onNotification?: (notification: any) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, onConnect, onDisconnect, onNotification } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!autoConnect) return;

    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.log('No admin auth token found, skipping socket connection');
      return;
    }

    // Initialize socket connection - remove /api from URL for socket connection
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const socketURL = apiURL.replace('/api', '');
    console.log('Admin connecting to socket server:', socketURL);

    const socket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Notification handler
    socket.on('notification', (notification) => {
      console.log('Received notification via socket:', notification);
      onNotification?.(notification);

      // Invalidate notification queries to refetch
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    });

    // Cleanup
    return () => {
      console.log('Cleaning up socket connection');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('notification');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, onConnect, onDisconnect, onNotification, queryClient]);

  const fetchNotifications = (page = 1, limit = 20) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('fetch-notifications', { page, limit });
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-notification-read', { notificationId });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  };

  const markAllNotificationsAsRead = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-all-notifications-read');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};
