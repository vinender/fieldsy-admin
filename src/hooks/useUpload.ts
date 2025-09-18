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

      const response = await axiosClient.post('/upload/admin/direct', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
  });
}