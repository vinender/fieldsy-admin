import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  field?: {
    id: string;
    name: string;
  };
  booking?: {
    id: string;
    date: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Fetch reviews for a specific field
export const useFieldReviews = (fieldId: string | undefined) => {
  return useQuery<ReviewsResponse>({
    queryKey: ['field-reviews', fieldId],
    queryFn: async () => {
      if (!fieldId) throw new Error('Field ID is required');
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/reviews/field/${fieldId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch field reviews');
      }

      return response.json();
    },
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Fetch all reviews (admin)
export const useAllReviews = (page = 1, limit = 10) => {
  return useQuery<ReviewsResponse>({
    queryKey: ['all-reviews', page, limit],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/reviews?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Delete a review (admin)
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['field-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    },
  });
};

// Approve/Flag a review (admin)
export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: 'APPROVED' | 'FLAGGED' }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['field-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    },
  });
};

// Get review statistics for dashboard
export const useReviewStats = () => {
  return useQuery({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/reviews/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch review statistics');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};