'use client';

import { useState } from 'react';
import { X, Phone, Shield } from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerified: (userData: any) => void;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  phoneNumber,
  onVerified
}: PhoneVerificationModalProps) {
  const { language } = useLanguage();
  const { verifyPhone } = useAuth();
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await authApi.sendOTP(phoneNumber, 'sms');
      toast.success(getTranslation('common', 'otpSent', language));
      setStep('verify');
      setResendTimer(60);
      
      // Countdown timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('common', 'otpSendFailed', language));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (verificationCode.length !== 6) {
      toast.error(getTranslation('common', 'otpInvalid', language));
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOTP(phoneNumber, verificationCode);
      const { access_token, user } = response.data.data;
      
      // Store auth data in AuthContext
      verifyPhone(user, access_token);
      
      toast.success(getTranslation('common', 'phoneVerified', language));
      onVerified(user);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || getTranslation('common', 'otpVerifyFailed', language));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setVerificationCode('');
    setStep('send');
    handleSendOTP();
  };

  return (
    <div className="fixed inset-0 bg-[hsl(var(--foreground))/0.5] backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {getTranslation('common', 'verifyPhone', language)}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            {getTranslation('common', 'verifyPhoneDescription', language)}
          </p>
        </div>

        {step === 'send' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                {getTranslation('common', 'phoneNumber', language)}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                <input
                  type="tel"
                  value={phoneNumber}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-[hsl(var(--input))] rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                />
              </div>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  {getTranslation('common', 'sending', language)}...
                </span>
              ) : (
                getTranslation('common', 'sendCode', language)
              )}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                {getTranslation('common', 'verificationCode', language)}
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-[hsl(var(--input))] rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary focus:border-transparent bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                autoFocus
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 text-center">
                {getTranslation('common', 'codeSentTo', language)} {phoneNumber}
              </p>
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  {getTranslation('common', 'verifying', language)}...
                </span>
              ) : (
                getTranslation('common', 'verify', language)
              )}
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {getTranslation('common', 'resendIn', language)} {resendTimer}s
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {getTranslation('common', 'resendCode', language)}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
            {getTranslation('common', 'otpNote', language)}
          </p>
        </div>
      </div>
    </div>
  );
}
