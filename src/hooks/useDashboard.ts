import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/types';

// Get dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; stats: DashboardStats }>('/admin/stats');
      return response.data.stats;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};