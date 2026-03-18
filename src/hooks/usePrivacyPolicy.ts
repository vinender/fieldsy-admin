
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PrivacySection {
    id: string;
    title: string;
    content: string | string[];
    isList: boolean;
    order: number;
}

export const usePrivacyPolicy = () => {
    return useQuery({
        queryKey: ['privacy-policy'],
        queryFn: async () => {
            const response = await api.get('/privacy-policy');
            return response.data.data as PrivacySection[];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreatePrivacySection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<PrivacySection, 'id' | 'order'>) => {
            const response = await api.post('/privacy-policy', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privacy-policy'] });
        },
    });
};

export const useUpdatePrivacySection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<PrivacySection> }) => {
            const response = await api.put(`/privacy-policy/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privacy-policy'] });
        },
    });
};

export const useDeletePrivacySection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/privacy-policy/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privacy-policy'] });
        },
    });
};

export const useBulkUpdatePrivacyPolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (policies: PrivacySection[]) => {
            const response = await api.put('/privacy-policy/bulk', { policies });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privacy-policy'] });
        },
    });
};
