import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/types';

// Get dashboard statistics
export const useDashboardStats = (period: string = 'Weekly') => {
  return useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; stats: DashboardStats }>(`/admin/stats?period=${period}`);
      return response.data.stats;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};