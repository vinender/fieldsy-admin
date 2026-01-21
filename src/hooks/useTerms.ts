
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Term {
    id: string;
    title: string;
    content: string | string[];
    isList: boolean;
    order: number;
}

export const useTerms = () => {
    return useQuery({
        queryKey: ['terms'],
        queryFn: async () => {
            const response = await api.get('/terms');
            return response.data.data as Term[];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Term, 'id' | 'order'>) => {
            const response = await api.post('/terms', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terms'] });
        },
    });
};

export const useUpdateTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Term> }) => {
            const response = await api.put(`/terms/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terms'] });
        },
    });
};

export const useDeleteTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/terms/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terms'] });
        },
    });
};

export const useBulkUpdateTerms = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (terms: Term[]) => {
            const response = await api.put('/terms/bulk', { terms });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terms'] });
        },
    });
};
