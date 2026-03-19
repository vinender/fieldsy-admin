import React, { useRef, useState } from 'react';
import { X, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { useUploadFile, useDeleteFile } from '@/hooks/useUpload';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

interface BannerSettingsProps {
  formData: {
    bannerText: string;
    highlightedText: string;
    heroBackgroundImage: string;
    heroBackgroundImages: string[];
  };
  setFormData: (data: any) => void;
  setHasChanges: (value: boolean) => void;
}

const MAX_HERO_IMAGES = 5;

export default function BannerSettings({ formData, setFormData, setHasChanges }: BannerSettingsProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();

  const images = formData.heroBackgroundImages || [];
  const selectedImage = formData.heroBackgroundImage || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    if (images.length + files.length > MAX_HERO_IMAGES) {
      toast.error(`Maximum ${MAX_HERO_IMAGES} images allowed`);
      return;
    }

    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} exceeds 10MB`); return false; }
      return true;
    });
    if (!validFiles.length) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of validFiles) {
        const result = await uploadFileMutation.mutateAsync({ file, folder: 'settings/hero', convertToAvif: true });
        urls.push(result.fileUrl);
      }

      const newImages = [...images, ...urls];
      const newSelected = selectedImage || urls[0]; // Auto-select first if none selected

      setFormData((prev: any) => ({
        ...prev,
        heroBackgroundImages: newImages,
        heroBackgroundImage: newSelected,
      }));
      setHasChanges(true);
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelect = (url: string) => {
    setFormData((prev: any) => ({ ...prev, heroBackgroundImage: url }));
    setHasChanges(true);
    toast.success('Hero image selected');
  };

  const handleDelete = async (url: string) => {
    if (!confirm('Delete this image permanently from storage?')) return;

    setDeleting(url);
    try {
      await deleteFileMutation.mutateAsync(url);

      const newImages = images.filter((img: string) => img !== url);
      const newSelected = selectedImage === url ? (newImages[0] || '') : selectedImage;

      setFormData((prev: any) => ({
        ...prev,
        heroBackgroundImages: newImages,
        heroBackgroundImage: newSelected,
      }));
      setHasChanges(true);
      toast.success('Image deleted');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete image from storage');
    } finally {
      setDeleting(null);
    }
  };

  const CHAR_LIMITS = { bannerText: 150, highlightedText: 50 };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Banner Settings</h2>

      {/* Hero Background Images Gallery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hero Background Images
          <span className="text-xs text-gray-500 ml-2">({images.length}/{MAX_HERO_IMAGES})</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Upload up to {MAX_HERO_IMAGES} images. Click an image to select it as the active hero background.
        </p>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {images.map((url: string, index: number) => {
              const isSelected = url === selectedImage;
              const isDeleting = deleting === url;

              return (
                <div
                  key={url}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden border-3 transition-all ${
                    isSelected
                      ? 'border-green ring-2 ring-green/30 shadow-lg'
                      : 'border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => !isDeleting && handleSelect(url)}
                >
                  {/* Image */}
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={url}
                      alt={`Hero ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-green text-white rounded-full p-1 shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(url); }}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 disabled:opacity-50"
                    title="Delete from S3"
                  >
                    {isDeleting ? <Spinner size="sm" /> : <X className="w-3 h-3" />}
                  </button>

                  {/* Label */}
                  <div className={`absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium ${
                    isSelected ? 'bg-green text-white' : 'bg-black/50 text-white'
                  }`}>
                    {isSelected ? 'Active' : `Image ${index + 1}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Button */}
        {images.length < MAX_HERO_IMAGES && (
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              uploading ? 'border-green bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <Spinner size="lg" className="mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Drag & drop or <span className="text-green font-semibold">click to upload</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Recommended: 1920x1080 or larger. Max 10MB.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banner Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Text
          <span className="text-xs text-gray-500 ml-2">
            ({formData.bannerText.length}/{CHAR_LIMITS.bannerText} characters)
          </span>
        </label>
        <input
          type="text"
          name="bannerText"
          value={formData.bannerText}
          onChange={handleChange}
          maxLength={CHAR_LIMITS.bannerText}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the main banner text..."
        />
      </div>

      {/* Highlighted Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Highlighted Text
          <span className="text-xs text-gray-500 ml-2">
            ({formData.highlightedText.length}/{CHAR_LIMITS.highlightedText} characters)
          </span>
        </label>
        <input
          type="text"
          name="highlightedText"
          value={formData.highlightedText}
          onChange={handleChange}
          maxLength={CHAR_LIMITS.highlightedText}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the text to highlight..."
        />
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {formData.bannerText && formData.highlightedText ? (
              formData.bannerText.includes(formData.highlightedText) ? (
                formData.bannerText.split(formData.highlightedText).map((part, index, array) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="text-green font-semibold">{formData.highlightedText}</span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <>{formData.bannerText} <span className="text-green font-semibold">{formData.highlightedText}</span></>
              )
            ) : (
              formData.bannerText || 'Enter banner text to see preview'
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}
