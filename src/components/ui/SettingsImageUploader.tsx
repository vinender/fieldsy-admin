import React from 'react';
import { X, Upload, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

// Convert image file to WebP format
const convertToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Resize if needed (max 1920px width)
      const maxWidth = 1920;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFileName = file.name.replace(/\.[^/.]+$/, '.webp');
            const webpFile = new File([blob], webpFileName, { type: 'image/webp' });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        0.85 // Quality: 85%
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

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
        // Convert to WebP
        const webpFile = await convertToWebP(file);
        
        // Upload to S3
        const formData = new FormData();
        formData.append('file', webpFile);
        formData.append('folder', 'settings');
        
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const data = await response.json();
        return data.url;
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
  
  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  }[aspectRatio];
  
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
              <p className="text-sm text-gray-600">Uploading and converting to WebP...</p>
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
        <div className={`grid ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4 mt-4`}>
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className={`${aspectClass} overflow-hidden rounded-lg border border-gray-200`}>
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {!disabled && (
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}