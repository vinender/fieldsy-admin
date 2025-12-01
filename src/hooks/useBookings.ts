import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Booking } from '@/types';

interface BookingsResponse {
  success: boolean;
  bookings: Booking[];
  total: number;
  pages: number;
}

interface BookingDetailsResponse {
  success: boolean;
  booking: Booking;
}

// Filter types for bookings
interface BookingFilters {
  searchName?: string;
  status?: string;
  dateRange?: string;
}

// Get all bookings
export const useBookings = (page: number = 1, limit: number = 10, filters?: BookingFilters) => {
  return useQuery({
    queryKey: ['bookings', page, limit, filters],
    queryFn: async () => {
      const params: any = { page, limit };
      if (filters?.searchName && filters.searchName.trim()) {
        params.searchName = filters.searchName.trim();
      }
      // Only send status if not 'All'
      if (filters?.status && filters.status !== 'All') {
        params.status = filters.status;
      }
      // Only send dateRange if not 'All'
      if (filters?.dateRange && filters.dateRange !== 'All') {
        params.dateRange = filters.dateRange;
      }
      const response = await api.get<BookingsResponse>('/admin/bookings', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get booking details
export const useBookingDetails = (bookingId: string) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get<BookingDetailsResponse>(`/admin/bookings/${bookingId}`);
      return response.data.booking;
    },
    enabled: !!bookingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const response = await api.patch(`/bookings/${bookingId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
};