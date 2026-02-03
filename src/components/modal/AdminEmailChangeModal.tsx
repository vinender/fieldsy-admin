import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAdminRequestEmailChange, useAdminVerifyEmailChange } from '@/hooks/useUsers';

interface AdminEmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentEmail: string;
  onSuccess: () => void;
}

type Step = 'enter-email' | 'verify-otp';

export default function AdminEmailChangeModal({
  isOpen,
  onClose,
  userId,
  currentEmail,
  onSuccess,
}: AdminEmailChangeModalProps) {
  const [step, setStep] = useState<Step>('enter-email');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const requestMutation = useAdminRequestEmailChange();
  const verifyMutation = useAdminVerifyEmailChange();

  useEffect(() => {
    if (isOpen) {
      setStep('enter-email');
      setNewEmail('');
      setOtp(Array(6).fill(''));
      setEmailError(null);
      setOtpError(null);
      setResendCooldown(0);
      requestMutation.reset();
      verifyMutation.reset();
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRequestOtp = async () => {
    setEmailError(null);
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (trimmedEmail === currentEmail.toLowerCase()) {
      setEmailError('New email must be different from the current email');
      return;
    }

    try {
      await requestMutation.mutateAsync({ userId, newEmail: trimmedEmail });
      setStep('verify-otp');
      setResendCooldown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setEmailError(err?.response?.data?.error || 'Failed to send verification code');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (otpError) setOtpError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6) {
      handleVerifyOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = Array(6).fill('');
      pasted.split('').forEach((char, i) => { newOtp[i] = char; });
      setOtp(newOtp);
      if (pasted.length === 6) {
        handleVerifyOtp(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    setOtpError(null);
    try {
      await verifyMutation.mutateAsync({
        userId,
        newEmail: newEmail.trim().toLowerCase(),
        otp: otpValue,
      });
      onSuccess();
    } catch (err: any) {
      setOtpError(err?.response?.data?.error || 'Invalid or expired code');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || requestMutation.isPending) return;
    setOtp(Array(6).fill(''));
    setOtpError(null);
    try {
      await requestMutation.mutateAsync({ userId, newEmail: newEmail.trim().toLowerCase() });
      setResendCooldown(60);
    } catch {
      // Error handled inline
    }
  };

  const isLoading = requestMutation.isPending || verifyMutation.isPending;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={!isLoading ? onClose : undefined} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {step === 'enter-email' ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-700" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Change User Email</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Current: <span className="font-medium text-gray-700">{currentEmail}</span>
                </p>
                <p className="text-sm text-gray-500">
                  A verification code will be sent to the new email
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter new email address"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRequestOtp(); }}
                  disabled={isLoading}
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 text-white bg-green-700 rounded-lg hover:bg-green-800 font-medium transition-colors disabled:opacity-50"
                >
                  {requestMutation.isPending ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setStep('enter-email');
                  setOtp(Array(6).fill(''));
                  setOtpError(null);
                }}
                disabled={isLoading}
                className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-700" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Email</h3>
                <p className="text-sm text-gray-500">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-gray-700">{newEmail.trim()}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={isLoading}
                    className={`w-11 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${
                      otpError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
              {otpError && <p className="text-xs text-red-500 text-center mb-4">{otpError}</p>}

              <button
                onClick={() => handleVerifyOtp(otp.join(''))}
                disabled={isLoading || otp.join('').length < 6}
                className="w-full px-4 py-2.5 text-white bg-green-700 rounded-lg hover:bg-green-800 font-medium transition-colors disabled:opacity-50 mb-3"
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Verify & Update'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Didn&apos;t receive the code?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-gray-400">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={requestMutation.isPending}
                    className="text-green-700 font-semibold hover:underline disabled:opacity-50"
                  >
                    {requestMutation.isPending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
