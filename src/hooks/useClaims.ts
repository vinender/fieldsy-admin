import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface FieldClaim {
  id: string;
  fieldId: string;
  fullName: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  isLegalOwner: boolean;
  documents: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  field?: {
    id: string;
    name: string;
    city: string;
    state: string;
    address: string;
  };
}

interface ClaimsResponse {
  claims: FieldClaim[];
  total: number;
  pages: number;
  currentPage: number;
}

// Fetch all claims
export const useClaims = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['claims', page, limit],
    queryFn: async () => {
      const response = await api.get<ClaimsResponse>(`/admin/claims?page=${page}&limit=${limit}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Fetch single claim
export const useClaim = (claimId: string) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: async () => {
      const response = await api.get<FieldClaim>(`/admin/claims/${claimId}`);
      return response.data;
    },
    enabled: !!claimId,
  });
};

// Update claim status
export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimId, status, reviewNotes }: { 
      claimId: string; 
      status: 'APPROVED' | 'REJECTED';
      reviewNotes?: string;
    }) => {
      const response = await api.patch(`/admin/claims/${claimId}/status`, {
        status,
        reviewNotes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
};