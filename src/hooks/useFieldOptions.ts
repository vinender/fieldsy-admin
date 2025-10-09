import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// Types
export interface FieldOption {
  id: string;
  category: string;
  value: string;
  label: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFieldOptionData {
  category: string;
  value: string;
  label: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateFieldOptionData {
  label?: string;
  isActive?: boolean;
  order?: number;
}

// Query Keys
export const fieldOptionsQueryKeys = {
  all: ['field-options'] as const,
  admin: () => [...fieldOptionsQueryKeys.all, 'admin'] as const,
  adminList: (category?: string, page?: number) =>
    [...fieldOptionsQueryKeys.admin(), 'list', { category, page }] as const,
};

// Admin: Get all field properties (including inactive)
export function useFieldOptionsAdmin(
  category?: string,
  page = 1,
  limit = 50,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOptionsQueryKeys.adminList(category, page),
    queryFn: async () => {
      const params: any = { page, limit };
      if (category) params.category = category;
      const response = await api.get('/field-properties/admin/all', { params });
      return response.data;
    },
    ...options,
  });
}

// Admin: Create field property
export function useCreateFieldOption(
  options?: Omit<UseMutationOptions<any, Error, CreateFieldOptionData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFieldOptionData) => {
      const response = await api.post('/field-properties/admin', data);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field property created successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, {} as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create field property');
      if (options?.onError) {
        options.onError(error, {} as any, {} as any);
      }
    },
    ...options,
  });
}

// Admin: Update field property
export function useUpdateFieldOption(
  options?: Omit<UseMutationOptions<any, Error, { id: string; data: UpdateFieldOptionData }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFieldOptionData }) => {
      const response = await api.put(`/field-properties/admin/${id}`, data);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field property updated successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, {} as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update field property');
      if (options?.onError) {
        options.onError(error, {} as any, {} as any);
      }
    },
    ...options,
  });
}

// Admin: Delete field property
export function useDeleteFieldOption(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/field-properties/admin/${id}`);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field property deleted successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, '' as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete field property');
      if (options?.onError) {
        options.onError(error, '' as any, {} as any);
      }
    },
    ...options,
  });
}

// Admin: Bulk update order
export function useUpdateFieldOptionsOrder(
  options?: Omit<UseMutationOptions<any, Error, Array<{ id: string; order: number }>>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; order: number }>) => {
      const response = await api.post('/field-properties/admin/bulk-order', { updates });
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field properties order updated successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, [] as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update field properties order');
      if (options?.onError) {
        options.onError(error, [] as any, {} as any);
      }
    },
    ...options,
  });
}
