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
export const useFields = (page: number = 1, limit: number = 10, search: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['fields', page, limit, search],
    queryFn: async () => {
      const response = await api.get<FieldsResponse>('/admin/fields', {
        params: { page, limit, search }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    enabled,
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

// Toggle field claimed status with optimistic update
export const useToggleFieldClaimed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, isClaimed }: { fieldId: string; isClaimed: boolean }) => {
      const response = await api.patch(`/fields/${fieldId}`, { isClaimed });
      return response.data;
    },
    onMutate: async ({ fieldId, isClaimed }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-field', fieldId] });
      await queryClient.cancelQueries({ queryKey: ['fields'] });

      // Snapshot the previous value
      const previousField = queryClient.getQueryData(['admin-field', fieldId]);

      // Optimistically update the cache
      queryClient.setQueryData(['admin-field', fieldId], (old: any) => {
        if (!old) return old;
        // Handle both wrapped and unwrapped response formats
        if (old.data) {
          return { ...old, data: { ...old.data, isClaimed } };
        }
        return { ...old, isClaimed };
      });

      // Return context with the previous value
      return { previousField };
    },
    onError: (err, { fieldId }, context) => {
      // Rollback on error
      if (context?.previousField) {
        queryClient.setQueryData(['admin-field', fieldId], context.previousField);
      }
    },
    onSettled: (data, error, { fieldId }) => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['admin-field', fieldId] });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};

// Toggle field blocked status (admin only)
export const useToggleFieldBlocked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await api.patch(`/fields/${fieldId}/toggle-blocked`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};

// Toggle field approved status (admin only)
export const useToggleFieldApproved = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await api.patch(`/fields/${fieldId}/toggle-approved`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};

// Get single field details for admin (with owner and booking data)
export const useFieldDetails = (fieldId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-field', fieldId],
    queryFn: async () => {
      if (!fieldId) throw new Error('Field ID is required');
      const response = await api.get(`/admin/fields/${fieldId}`);
      return response.data;
    },
    enabled: !!fieldId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
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