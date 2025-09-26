import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Admin } from '@/types';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

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
      console.log('Attempting login with:', { email: data.email });
      try {
        const response = await api.post<LoginResponse>('/admin/login', data);
        console.log('Login response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Login successful, storing token');
      console.log('Response data:', data);
      localStorage.setItem('adminToken', data.token);
      queryClient.setQueryData(['admin'], data.admin);
      toast.success('Login successful! Redirecting...');
      
      // Delay redirect so you can see the network request
      setTimeout(() => {
        console.log('Now redirecting to dashboard...');
        router.push('/dashboard');
      }, 2000); // 2 second delay to inspect network tab
    },
    onError: (error: any) => {
      console.error('Login mutation error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
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