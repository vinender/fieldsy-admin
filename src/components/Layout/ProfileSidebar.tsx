import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Check,
  X,
  Pencil,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useVerifyAdmin, useUpdateAdminProfile, useUploadAdminProfileImage, useDeleteAdminProfileImage, useAdminProfileRequestEmailChange, useAdminProfileVerifyEmailChange, useAdminProfileChangePassword } from '@/hooks/useAuth';
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
  const requestEmailChangeMutation = useAdminProfileRequestEmailChange();
  const verifyEmailChangeMutation = useAdminProfileVerifyEmailChange();
  const changePasswordMutation = useAdminProfileChangePassword();

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+44',
    phoneNumber: '',
    bio: ''
  });

  // Email change state
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [emailChangeStep, setEmailChangeStep] = useState<'enter-email' | 'verify-otp'>('enter-email');
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''));
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password change state
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Reset modals when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setShowEmailChangeModal(false);
      setShowPasswordChangeModal(false);
    }
  }, [isOpen]);

  const openEmailChangeModal = () => {
    setEmailChangeStep('enter-email');
    setNewEmail('');
    setEmailOtp(Array(6).fill(''));
    setEmailError(null);
    setOtpError(null);
    setResendCooldown(0);
    requestEmailChangeMutation.reset();
    verifyEmailChangeMutation.reset();
    setShowEmailChangeModal(true);
  };

  const handleRequestEmailOtp = async () => {
    setEmailError(null);
    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail) { setEmailError('Email address is required'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) { setEmailError('Please enter a valid email address'); return; }
    if (trimmedEmail === admin?.email?.toLowerCase()) { setEmailError('New email must be different from your current email'); return; }
    try {
      await requestEmailChangeMutation.mutateAsync({ newEmail: trimmedEmail });
      setEmailChangeStep('verify-otp');
      setResendCooldown(60);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setEmailError(err?.response?.data?.error || 'Failed to send verification code');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...emailOtp];
    newOtp[index] = value.slice(-1);
    setEmailOtp(newOtp);
    if (otpError) setOtpError(null);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6) handleVerifyEmailOtp(fullOtp);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) otpInputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = Array(6).fill('');
      pasted.split('').forEach((char, i) => { newOtp[i] = char; });
      setEmailOtp(newOtp);
      if (pasted.length === 6) handleVerifyEmailOtp(pasted);
      else otpInputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerifyEmailOtp = async (otpValue: string) => {
    setOtpError(null);
    try {
      await verifyEmailChangeMutation.mutateAsync({ newEmail: newEmail.trim().toLowerCase(), otp: otpValue });
      await refetch();
      toast.success('Email updated successfully');
      setShowEmailChangeModal(false);
    } catch (err: any) {
      setOtpError(err?.response?.data?.error || 'Invalid or expired code');
    }
  };

  const handleResendEmailOtp = async () => {
    if (resendCooldown > 0 || requestEmailChangeMutation.isPending) return;
    setEmailOtp(Array(6).fill(''));
    setOtpError(null);
    try {
      await requestEmailChangeMutation.mutateAsync({ newEmail: newEmail.trim().toLowerCase() });
      setResendCooldown(60);
    } catch {}
  };

  const openPasswordChangeModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setPasswordError(null);
    changePasswordMutation.reset();
    setShowPasswordChangeModal(true);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!currentPassword) { setPasswordError('Current password is required'); return; }
    if (!newPassword) { setPasswordError('New password is required'); return; }
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setShowPasswordChangeModal(false);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || 'Failed to update password');
    }
  };

  const isEmailLoading = requestEmailChangeMutation.isPending || verifyEmailChangeMutation.isPending;

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
                        className="w-full h-12 sm:h-14 px-4 pr-20 text-sm sm:text-[15px] border border-[#e3e3e3] rounded-full bg-gray-50 opacity-60"
                      />
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#3a6b22]" />
                        <button
                          type="button"
                          onClick={openEmailChangeModal}
                          className="text-xs sm:text-sm font-semibold text-[#3a6b22] hover:text-[#2e5519] transition-colors underline"
                        >
                          Edit
                        </button>
                      </div>
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

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 sm:pt-6">
                    <button
                      onClick={openPasswordChangeModal}
                      className="text-sm sm:text-base font-semibold text-[#3a6b22] underline hover:opacity-80 transition-opacity"
                    >
                      Change Password?
                    </button>
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
      {/* Email Change Modal */}
      {showEmailChangeModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60] transition-opacity" onClick={!isEmailLoading ? () => setShowEmailChangeModal(false) : undefined} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowEmailChangeModal(false)} disabled={isEmailLoading} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50">
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {emailChangeStep === 'enter-email' ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-green-700" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Change Email</h3>
                    <p className="text-sm text-gray-500 mb-1">Current: <span className="font-medium text-gray-700">{admin?.email}</span></p>
                    <p className="text-sm text-gray-500">A verification code will be sent to the new email</p>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter new email address"
                      value={newEmail}
                      onChange={(e) => { setNewEmail(e.target.value); if (emailError) setEmailError(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRequestEmailOtp(); }}
                      disabled={isEmailLoading}
                      className={`w-full h-12 px-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowEmailChangeModal(false)} disabled={isEmailLoading} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50">Cancel</button>
                    <button onClick={handleRequestEmailOtp} disabled={isEmailLoading} className="flex-1 px-4 py-2.5 text-white bg-green-700 rounded-lg hover:bg-green-800 font-medium transition-colors disabled:opacity-50">
                      {requestEmailChangeMutation.isPending ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => { setEmailChangeStep('enter-email'); setEmailOtp(Array(6).fill('')); setOtpError(null); }} disabled={isEmailLoading} className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-green-700" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Email</h3>
                    <p className="text-sm text-gray-500">Enter the 6-digit code sent to <span className="font-medium text-gray-700">{newEmail.trim()}</span></p>
                  </div>
                  <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                    {emailOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        disabled={isEmailLoading}
                        className={`w-11 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${otpError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    ))}
                  </div>
                  {otpError && <p className="text-xs text-red-500 text-center mb-4">{otpError}</p>}
                  <button onClick={() => handleVerifyEmailOtp(emailOtp.join(''))} disabled={isEmailLoading || emailOtp.join('').length < 6} className="w-full px-4 py-2.5 text-white bg-green-700 rounded-lg hover:bg-green-800 font-medium transition-colors disabled:opacity-50 mb-3">
                    {verifyEmailChangeMutation.isPending ? 'Verifying...' : 'Verify & Update'}
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    Didn&apos;t receive the code?{' '}
                    {resendCooldown > 0 ? (
                      <span className="text-gray-400">Resend in {resendCooldown}s</span>
                    ) : (
                      <button onClick={handleResendEmailOtp} disabled={requestEmailChangeMutation.isPending} className="text-green-700 font-semibold hover:underline disabled:opacity-50">
                        {requestEmailChangeMutation.isPending ? 'Sending...' : 'Resend Code'}
                      </button>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60] transition-opacity" onClick={!changePasswordMutation.isPending ? () => setShowPasswordChangeModal(false) : undefined} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowPasswordChangeModal(false)} disabled={changePasswordMutation.isPending} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50">
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Change Password</h3>
                <p className="text-sm text-gray-500">Enter your current password and a new password</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input type={showCurrentPw ? 'text' : 'password'} placeholder="Enter current password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); if (passwordError) setPasswordError(null); }} disabled={changePasswordMutation.isPending} className={`w-full h-12 px-4 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${passwordError ? 'border-red-500' : 'border-gray-300'}`} />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input type={showNewPw ? 'text' : 'password'} placeholder="Enter new password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); if (passwordError) setPasswordError(null); }} disabled={changePasswordMutation.isPending} className={`w-full h-12 px-4 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${passwordError ? 'border-red-500' : 'border-gray-300'}`} />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') handleChangePassword(); }} disabled={changePasswordMutation.isPending} className={`w-full h-12 px-4 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${passwordError ? 'border-red-500' : 'border-gray-300'}`} />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowPasswordChangeModal(false)} disabled={changePasswordMutation.isPending} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleChangePassword} disabled={changePasswordMutation.isPending} className="flex-1 px-4 py-2.5 text-white bg-green-700 rounded-lg hover:bg-green-800 font-medium transition-colors disabled:opacity-50">
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProfileSidebar;
