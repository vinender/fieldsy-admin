import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Admin } from '@/types';
import { useRouter } from 'next/router';

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}

// Login mutation
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<LoginResponse>('/admin/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('adminToken', data.token);
      queryClient.setQueryData(['admin'], data.admin);
      router.push('/dashboard');
    },
  });
};

// Verify admin query
export const useVerifyAdmin = () => {
  return useQuery({
    queryKey: ['admin'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; admin: Admin }>('/admin/verify');
      return response.data.admin;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Logout function
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem('adminToken');
    queryClient.clear();
    router.push('/login');
  };
};