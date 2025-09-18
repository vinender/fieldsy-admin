import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface SystemSettings {
  id: string;
  defaultCommissionRate: number;
  cancellationWindowHours: number;
  maxBookingsPerUser: number;
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  bannerText?: string;
  highlightedText?: string;
  aboutTitle?: string;
  aboutDogImage?: string;
  aboutFamilyImage?: string;
  aboutDogIcons?: string[];
  createdAt: string;
  updatedAt: string;
}

// Fetch system settings
export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const response = await api.get('/settings/admin');
      return response.data.data as SystemSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update system settings
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      const response = await api.put('/settings/admin', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
    },
  });
};