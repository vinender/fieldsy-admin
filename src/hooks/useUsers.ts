import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';

interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
  pages: number;
}

// Get all users (supports search by name, email, or userId)
export const useUsers = (page: number = 1, limit: number = 10, role?: string, search?: string) => {
  return useQuery({
    queryKey: ['users', page, limit, role, search],
    queryFn: async () => {
      const response = await api.get<UsersResponse>('/admin/users', {
        params: { page, limit, ...(role && { role }), ...(search && { search }) }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Block user
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const response = await api.patch(`/admin/users/${userId}/block`, { reason });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both users and fieldOwners queries to update all relevant pages
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['fieldOwners'] });
    },
  });
};

// Unblock user
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.patch(`/admin/users/${userId}/unblock`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both users and fieldOwners queries to update all relevant pages
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['fieldOwners'] });
    },
  });
};

// Get user details with paginated bookings
export const useUserDetails = (userId: string | undefined, bookingPage: number = 1, bookingLimit: number = 10) => {
  return useQuery({
    queryKey: ['user', userId, bookingPage, bookingLimit],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await api.get(`/admin/users/${userId}`, {
        params: { bookingPage, bookingLimit }
      });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};