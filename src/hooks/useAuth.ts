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
      toast.success('Login successfull');
      
      // Delay redirect so you can see the network request
      setTimeout(() => {
        console.log('Now redirecting to dashboard...');
        router.push('/dashboard');
      }, 2000); // 2 second delay to inspect network tab
    },
    onError: (error: any) => {
      console.error('Login mutation error:', error.response?.data || error.message);
      // Error message is displayed inline on the login form
      // No need for toast notification
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

// Update admin profile mutation
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; phone?: string; bio?: string }) => {
      const response = await api.patch('/admin/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

// Upload admin profile image mutation
export const useUploadAdminProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/admin/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Profile image uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });
};

// Delete admin profile image mutation
export const useDeleteAdminProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/admin/profile/delete-image');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Profile image deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete image');
    },
  });
};

// Admin: Request email change OTP for own profile
export const useAdminProfileRequestEmailChange = () => {
  return useMutation({
    mutationFn: async ({ newEmail }: { newEmail: string }) => {
      const response = await api.post('/admin/profile/request-email-change', { newEmail });
      return response.data;
    },
  });
};

// Admin: Verify email change OTP for own profile
export const useAdminProfileVerifyEmailChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ newEmail, otp }: { newEmail: string; otp: string }) => {
      const response = await api.post('/admin/profile/verify-email-change', { newEmail, otp });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
};

// Admin: Change own password
export const useAdminProfileChangePassword = () => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const response = await api.patch('/admin/profile/change-password', { currentPassword, newPassword });
      return response.data;
    },
  });
};