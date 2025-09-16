import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

// Fetch all notifications for admin
export const useAdminNotifications = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['admin-notifications', page, limit],
    queryFn: async () => {
      const response = await api.get<NotificationsResponse>('/admin/notifications', {
        params: { page, limit }
      });
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.patch(`/admin/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.patch('/admin/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.delete(`/admin/notifications/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};