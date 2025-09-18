import React from 'react';
import { X, Upload, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUploadFile } from '@/hooks/useUpload';

interface SettingsImageUploaderProps {
  value?: string | string[];
  onChange?: (urls: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait';
}


export function SettingsImageUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 1,
  label,
  description,
  className = '',
  disabled = false,
  aspectRatio = 'video'
}: SettingsImageUploaderProps) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileMutation = useUploadFile();
  
  // Initialize from value prop
  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setImages(value);
      } else if (typeof value === 'string' && value) {
        setImages([value]);
      }
    }
  }, [value]);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await processFiles(files);
  };
  
  const processFiles = async (files: File[]) => {
    if (!files.length) return;
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`);
        setTimeout(() => setError(null), 3000);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is larger than 10MB`);
        setTimeout(() => setError(null), 3000);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    if (!multiple && validFiles.length > 1) {
      validFiles.splice(1);
    }
    
    if (multiple && images.length + validFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setUploading(true);
    
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const result = await uploadFileMutation.mutateAsync({
          file,
          folder: 'settings',
          convertToWebp: true,
        });
        return result.fileUrl;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const newImages = multiple 
        ? [...images, ...uploadedUrls]
        : uploadedUrls;
      
      setImages(newImages);
      onChange?.(multiple ? newImages : newImages[0]);
      
      setSuccess('Images uploaded successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onChange?.(multiple ? newImages : newImages[0] || '');
  };
  
  // Determine preview size based on aspect ratio and whether it's multiple
  const getPreviewClass = () => {
    if (multiple) {
      return 'w-full h-24 sm:h-28 md:h-32';
    }
    
    switch (aspectRatio) {
      case 'square':
        return 'w-40 h-40 sm:w-48 sm:h-48';
      case 'portrait':
        return 'w-40 h-52 sm:w-48 sm:h-64';
      case 'video':
      default:
        return 'w-64 h-36 sm:w-72 sm:h-40';
    }
  };
  
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}
      
      {/* Notifications */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-2 p-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}
      
      {/* Upload Area */}
      {(!images.length || (multiple && images.length < maxFiles)) && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-green bg-green-lighter' : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-green animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Drag and drop or <span className="text-green font-semibold">click to browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images will be converted to WebP format
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Preview Grid */}
      {images.length > 0 && (
        <div className={`${multiple ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4' : 'flex flex-wrap gap-4'} mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100`}>
          {images.map((url, index) => (
            <div key={index} className="relative group inline-block">
              <div className="space-y-2">
                <div className={`${getPreviewClass()} overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow relative`}>
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-contain "
                  />
                  {!disabled && (
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center truncate max-w-[10rem]">
                  Image {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}