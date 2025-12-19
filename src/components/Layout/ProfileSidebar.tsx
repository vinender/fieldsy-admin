import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Check,
  X
} from 'lucide-react';
import { useVerifyAdmin, useUpdateAdminProfile, useUploadAdminProfileImage, useDeleteAdminProfileImage } from '@/hooks/useAuth';
import { toast } from 'sonner';

// UK phone number length limits (excluding +44 country code)
const UK_PHONE_MAX_LENGTH = 11;

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const { data: admin, isLoading, refetch } = useVerifyAdmin();
  const updateProfileMutation = useUpdateAdminProfile();
  const uploadImageMutation = useUploadAdminProfileImage();
  const deleteImageMutation = useDeleteAdminProfileImage();

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+44',
    phoneNumber: '',
    bio: ''
  });

  // Initialize form data when admin loads
  useEffect(() => {
    if (admin) {
      setFormData({
        fullName: admin.name || '',
        email: admin.email || '',
        countryCode: '+44',
        phoneNumber: admin.phone?.replace('+44', '').trim() || '',
        bio: admin.bio || ''
      });
    }
  }, [admin]);

  const handleInputChange = (field: string, value: string) => {
    // For phone number, only allow digits and enforce max length
    if (field === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, UK_PHONE_MAX_LENGTH);
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      const updates: any = {};

      if (formData.fullName !== admin?.name) {
        updates.name = formData.fullName;
      }

      if (formData.phoneNumber && formData.phoneNumber !== admin?.phone?.replace('+44', '').trim()) {
        updates.phone = `${formData.countryCode}${formData.phoneNumber}`;
      }

      if (formData.bio !== admin?.bio) {
        updates.bio = formData.bio;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfileMutation.mutateAsync(updates);
        await refetch();
        toast.success('Profile updated successfully');
      } else {
        toast.info('No changes to update');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only image files (JPEG, PNG, GIF, or WebP)');
        event.target.value = '';
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        event.target.value = '';
        return;
      }

      try {
        await uploadImageMutation.mutateAsync(file);
        await refetch();
        toast.success('Profile image updated successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to upload image');
      } finally {
        event.target.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (confirm('Are you sure you want to delete your profile image?')) {
      try {
        await deleteImageMutation.mutateAsync();
        await refetch();
        toast.success('Profile image deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete image');
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:max-w-[90%] md:max-w-[700px] bg-[#fffcf3] z-50 transform transition-transform duration-300 ease-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={onClose}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-[22px] sm:text-[29px] font-semibold text-[#192215] truncate">My Profile</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-100px)] overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a6b22]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Details Card */}
              <div className="bg-white rounded-[14px] border border-[#19221533] p-4 sm:p-6 lg:p-8">
                <h2 className="text-base sm:text-lg font-semibold text-[#192215] mb-4">Profile details</h2>

                {/* User Info */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  {admin?.image ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      <img
                        src={admin.image}
                        alt={admin?.name || 'Admin'}
                        className="w-full h-full rounded-full object-cover absolute inset-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.fallback-initial')) {
                            const initial = document.createElement('span');
                            initial.className = 'fallback-initial text-white text-lg sm:text-xl font-semibold relative z-10';
                            initial.textContent = admin.name?.charAt(0).toUpperCase() || admin.email?.charAt(0).toUpperCase() || 'A';
                            parent.appendChild(initial);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl font-semibold">
                        {admin?.name?.charAt(0).toUpperCase() || admin?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-[18px] font-semibold text-[#323232] truncate">{admin?.name || 'Admin'}</h3>
                    <p className="text-xs sm:text-sm text-[#323232] truncate">{admin?.email}</p>
                  </div>
                </div>

                <div className="h-px bg-[#e2e2e2] my-4" />

                {/* More Info Section */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-[#192215]">More info</h4>

                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-start sm:items-center gap-3">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215] flex-shrink-0" />
                      <span className="text-sm sm:text-base text-[#8d8d8d] break-all">{admin?.email}</span>
                    </div>

                    {admin?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215] flex-shrink-0" />
                        <span className="text-sm sm:text-base text-[#8d8d8d]">{admin.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* About Me Section */}
                {admin?.bio && (
                  <div className="mt-6">
                    <h4 className="text-xs sm:text-sm font-bold text-[#192215] mb-3">About me</h4>
                    <p className="text-sm sm:text-base text-[#8d8d8d] leading-relaxed">
                      {admin.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Edit Profile Section */}
              <div className="bg-white rounded-[14px] border border-[#19221533] p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#192215] mb-4 sm:mb-6">Edit profile</h2>

                {/* Profile Image Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
                  {admin?.image ? (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      <img
                        src={admin.image}
                        alt={admin.name || 'Admin'}
                        className="w-full h-full rounded-full object-cover absolute inset-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.fallback-initial')) {
                            const initial = document.createElement('span');
                            initial.className = 'fallback-initial text-white text-xl sm:text-2xl font-semibold relative z-10';
                            initial.textContent = admin.name?.charAt(0).toUpperCase() || admin.email?.charAt(0).toUpperCase() || 'A';
                            parent.appendChild(initial);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3A6B22] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl sm:text-2xl font-semibold">
                        {admin?.name?.charAt(0).toUpperCase() || admin?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <label className="text-sm sm:text-base font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadImageMutation.isPending || deleteImageMutation.isPending}
                      />
                      {uploadImageMutation.isPending ? 'Uploading...' : 'Change Profile Image'}
                    </label>
                    {admin?.image && (
                      <button
                        onClick={handleDeleteImage}
                        disabled={deleteImageMutation.isPending || uploadImageMutation.isPending}
                        className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {deleteImageMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      maxLength={50}
                      className="w-full h-12 sm:h-14 px-4 text-sm sm:text-[15px] border border-[#e3e3e3] rounded-full focus:outline-none focus:border-[#3a6b22] transition-colors"
                    />
                    <p className="text-gray-500 text-xs mt-1 text-right">
                      {formData.fullName.length}/50
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full h-12 sm:h-14 px-4 pr-12 text-sm sm:text-[15px] border border-[#e3e3e3] rounded-full bg-gray-50 opacity-60"
                      />
                      <Check className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-[#3a6b22]" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center h-12 sm:h-14 px-3 sm:px-4 bg-white border border-[#e3e3e3] rounded-full">
                      <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-3 border-r border-[#8d8d8d]">
                        <span className="text-sm sm:text-[15px] text-[#192215]">{formData.countryCode}</span>
                      </div>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="Enter phone number"
                        maxLength={UK_PHONE_MAX_LENGTH}
                        className="flex-1 ml-2 sm:ml-3 bg-white text-sm sm:text-[15px] border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm sm:text-[15px] font-medium text-[#192215] mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      placeholder="Enter Bio"
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      maxLength={2000}
                      className="w-full h-[100px] sm:h-[122px] p-3 sm:p-4 bg-white border border-[#e3e3e3] rounded-[20px] text-sm sm:text-[15px] text-[#192215] leading-relaxed resize-none focus:outline-none focus:border-[#3a6b22] transition-colors"
                    />
                    <p className="text-gray-500 text-xs mt-1 text-right">
                      {formData.bio.length}/2000
                    </p>
                  </div>

                  {/* Update Button */}
                  <div className="flex justify-end pt-4 sm:pt-6">
                    <button
                      onClick={handleUpdate}
                      disabled={updateProfileMutation.isPending}
                      className="px-8 sm:px-12 py-3 sm:py-4 bg-[#3a6b22] text-white text-sm sm:text-base font-semibold rounded-full hover:bg-[#2d5319] transition-colors disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
