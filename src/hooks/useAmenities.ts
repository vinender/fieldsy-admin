import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface Amenity {
  id: string;
  name: string;
  label?: string;
  icon: string | null;
  isActive: boolean;
  order: number;
}

interface CreateAmenityData {
  name: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

interface UpdateAmenityData {
  id: string;
  data: Partial<CreateAmenityData>;
}

// Get all amenities
export const useAmenities = (activeOnly?: boolean) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['amenities', activeOnly],
    queryFn: async () => {
      const params = activeOnly ? '?activeOnly=true' : '';
      const response = await api.get(`/amenities${params}`);
      return response.data.data;
    }
  });

  return {
    amenities: data as Amenity[],
    isLoading,
    error,
    refetch
  };
};

// Get single amenity
export const useAmenity = (id: string) => {
  return useQuery({
    queryKey: ['amenity', id],
    queryFn: async () => {
      const response = await api.get(`/amenities/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

// Create amenity
export const useCreateAmenity = () => {
  return useMutation({
    mutationFn: async (data: CreateAmenityData) => {
      const response = await api.post('/amenities', data);
      return response.data;
    }
  });
};

// Update amenity
export const useUpdateAmenity = () => {
  return useMutation({
    mutationFn: async ({ id, data }: UpdateAmenityData) => {
      const response = await api.put(`/amenities/${id}`, data);
      return response.data;
    }
  });
};

// Delete amenity
export const useDeleteAmenity = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/amenities/${id}`);
      return response.data;
    }
  });
};

// Reorder amenities
export const useReorderAmenities = () => {
  return useMutation({
    mutationFn: async (amenityOrders: { id: string; order: number }[]) => {
      const response = await api.post('/amenities/reorder', { amenityOrders });
      return response.data;
    }
  });
};
