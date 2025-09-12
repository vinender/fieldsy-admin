import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface FieldOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  commissionRate: number | null;
  effectiveCommissionRate: number;
  isUsingDefault: boolean;
  fieldsCount: number;
  createdAt: string;
}

interface FieldOwnersResponse {
  success: boolean;
  data: {
    fieldOwners: FieldOwner[];
    defaultCommissionRate: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface CommissionSettingsResponse {
  success: boolean;
  data: {
    defaultCommissionRate: number;
  };
}

// Get field owners with pagination and search
export const useFieldOwners = (page: number = 1, limit: number = 10, search: string = '') => {
  return useQuery({
    queryKey: ['fieldOwners', page, limit, search],
    queryFn: async () => {
      const response = await api.get<FieldOwnersResponse>('/commission/field-owners', {
        params: { page, limit, search }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get commission settings
export const useCommissionSettings = () => {
  return useQuery({
    queryKey: ['commissionSettings'],
    queryFn: async () => {
      const response = await api.get<CommissionSettingsResponse>('/commission/settings');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update field owner commission
export const useUpdateFieldOwnerCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ownerId, 
      data 
    }: { 
      ownerId: string; 
      data: { useDefault: boolean } | { commissionRate: number } 
    }) => {
      const response = await api.put(`/commission/field-owner/${ownerId}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both field owners and commission settings queries
      queryClient.invalidateQueries({ queryKey: ['fieldOwners'] });
      queryClient.invalidateQueries({ queryKey: ['commissionSettings'] });
    },
  });
};

// Update default commission settings
export const useUpdateDefaultCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (defaultCommissionRate: number) => {
      const response = await api.put('/commission/settings', { 
        defaultCommissionRate 
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both queries as default rate affects field owners too
      queryClient.invalidateQueries({ queryKey: ['commissionSettings'] });
      queryClient.invalidateQueries({ queryKey: ['fieldOwners'] });
    },
  });
};