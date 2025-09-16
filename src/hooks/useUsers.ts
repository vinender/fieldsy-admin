import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';

interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
  pages: number;
}

// Get all users
export const useUsers = (page: number = 1, limit: number = 10, role?: string) => {
  return useQuery({
    queryKey: ['users', page, limit, role],
    queryFn: async () => {
      const response = await api.get<UsersResponse>('/admin/users', {
        params: { page, limit, ...(role && { role }) }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Block/Unblock user
export const useToggleUserBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, block }: { userId: string; block: boolean }) => {
      const response = await api.patch(`/users/${userId}/block`, { blocked: block });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Get user details with bookings
export const useUserDetails = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await api.get(`/admin/users/${userId}`);
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