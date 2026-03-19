import { useMutation } from '@tanstack/react-query';
import axiosClient from '@/lib/api';

interface UploadFileData {
  file: File;
  folder?: string;
  convertToAvif?: boolean; // Changed from convertToWebp
  convertToWebp?: boolean; // Keep for backwards compatibility
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, folder = 'settings', convertToAvif = true, convertToWebp }: UploadFileData) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      // Use AVIF by default, fallback to WebP setting for backwards compatibility
      formData.append('convertToAvif', String(convertToAvif ?? convertToWebp ?? true));

      // Don't set Content-Type header - let axios handle it automatically for FormData
      const response = await axiosClient.post('/upload/admin/direct', formData);

      return response.data;
    },
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await axiosClient.delete('/upload/admin/delete', {
        data: { url },
      });
      return response.data;
    },
  });
}

export function useUploadSingle() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Don't set Content-Type header - let axios handle it automatically for FormData
      const response = await axiosClient.post('/upload/single', formData);

      return response.data;
    },
  });
}