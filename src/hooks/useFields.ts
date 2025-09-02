import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Field } from '@/types';

interface FieldsResponse {
  success: boolean;
  fields: Field[];
  total: number;
  pages: number;
}

// Get all fields
export const useFields = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['fields', page, limit],
    queryFn: async () => {
      const response = await api.get<FieldsResponse>('/admin/fields', {
        params: { page, limit }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Toggle field active status
export const useToggleFieldStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, isActive }: { fieldId: string; isActive: boolean }) => {
      const response = await api.patch(`/fields/${fieldId}`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};

// Delete field
export const useDeleteField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await api.delete(`/fields/${fieldId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};