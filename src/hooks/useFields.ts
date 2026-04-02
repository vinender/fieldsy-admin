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

      // Snapshot the previous values
      const previousField = queryClient.getQueryData(['admin-field', fieldId]);

      // Optimistically update the detail page cache
      queryClient.setQueryData(['admin-field', fieldId], (old: any) => {
        if (!old) return old;
        if (old.data) {
          return { ...old, data: { ...old.data, isClaimed } };
        }
        return { ...old, isClaimed };
      });

      // Optimistically update ALL list page caches too
      queryClient.setQueriesData({ queryKey: ['fields'] }, (old: any) => {
        if (!old?.data?.fields) return old;
        return {
          ...old,
          data: {
            ...old.data,
            fields: old.data.fields.map((f: any) =>
              f.id === fieldId ? { ...f, isClaimed } : f
            )
          }
        };
      });

      return { previousField };
    },
    onError: (err, { fieldId }, context) => {
      // Rollback on error
      if (context?.previousField) {
        queryClient.setQueryData(['admin-field', fieldId], context.previousField);
      }
      // Also invalidate list to restore correct data
      queryClient.invalidateQueries({ queryKey: ['fields'] });
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

// Admin update field
export const useAdminUpdateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, data }: { fieldId: string; data: Record<string, any> }) => {
      const response = await api.put(`/fields/${fieldId}`, data);
      return response.data;
    },
    onSuccess: (_, { fieldId }) => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.invalidateQueries({ queryKey: ['admin-field', fieldId] });
    },
  });
};

// Admin create field
export const useAdminCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await api.post('/fields', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};

// Get field options (sizes, terrain types, etc.)
export const useFieldOptions = () => {
  return useQuery({
    queryKey: ['field-options'],
    queryFn: async () => {
      const response = await api.get('/field-properties');
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

// Get amenities list
export const useAmenities = () => {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const response = await api.get('/amenities');
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};