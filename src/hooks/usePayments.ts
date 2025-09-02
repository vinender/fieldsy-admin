import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Payment } from '@/types';

interface PaymentsResponse {
  success: boolean;
  payments: Payment[];
  total: number;
  pages: number;
}

// Get all payments
export const usePayments = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['payments', page, limit],
    queryFn: async () => {
      const response = await api.get<PaymentsResponse>('/admin/payments', {
        params: { page, limit }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Process refund
export const useProcessRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, amount, reason }: { paymentId: string; amount?: number; reason: string }) => {
      const response = await api.post(`/payments/${paymentId}/refund`, { amount, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};