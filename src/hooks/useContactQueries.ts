import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface QueriesResponse {
  success: boolean;
  data: ContactQuery[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    all: number;
    new: number;
    'in-progress': number;
    resolved: number;
  };
}

interface QueryStatusCounts {
  all: number;
  new: number;
  inProgress: number;
  resolved: number;
}

// Fetch all queries with pagination and filters
export const useContactQueries = (
  page: number = 1,
  limit: number = 10,
  status?: string,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ['contact-queries', page, limit, status, searchTerm],
    queryFn: async () => {
      const params: any = { page, limit };
      if (status && status !== 'All') params.status = status.toLowerCase();
      if (searchTerm) params.search = searchTerm;

      const response = await api.get<QueriesResponse>('/contact-queries', { params });

      // Transform response to match expected format
      return {
        queries: response.data.data,
        total: response.data.pagination.total,
        pages: response.data.pagination.totalPages,
        currentPage: response.data.pagination.page,
      };
    },
    staleTime: 30000, // 30 seconds
  });
};

// Fetch query status counts (reuses the main query with no filters)
export const useQueryStatusCounts = () => {
  return useQuery({
    queryKey: ['query-status-counts'],
    queryFn: async () => {
      const response = await api.get<QueriesResponse>('/contact-queries', {
        params: { page: 1, limit: 1 }
      });
      return {
        all: response.data.counts.all,
        new: response.data.counts.new,
        inProgress: response.data.counts['in-progress'],
        resolved: response.data.counts.resolved,
      };
    },
    staleTime: 30000,
  });
};

// Fetch single query by ID
export const useContactQuery = (id: string) => {
  return useQuery({
    queryKey: ['contact-query', id],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: ContactQuery }>(`/contact-queries/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Update query status and notes
export const useUpdateContactQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes
    }: {
      id: string;
      status?: string;
      adminNotes?: string;
    }) => {
      const response = await api.put(`/contact-queries/${id}`, {
        status,
        adminNotes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-queries'] });
      queryClient.invalidateQueries({ queryKey: ['query-status-counts'] });
    },
  });
};

// Delete query
export const useDeleteContactQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/contact-queries/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-queries'] });
      queryClient.invalidateQueries({ queryKey: ['query-status-counts'] });
    },
  });
};
