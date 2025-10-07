import { useMutation } from '@tanstack/react-query';
import axiosClient from '@/lib/api';

interface UploadFileData {
  file: File;
  folder?: string;
  convertToWebp?: boolean;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, folder = 'settings', convertToWebp = true }: UploadFileData) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('convertToWebp', String(convertToWebp));

      // Don't set Content-Type header - let axios handle it automatically for FormData
      const response = await axiosClient.post('/upload/admin/direct', formData);

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