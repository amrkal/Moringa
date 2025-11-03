'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { Phone, MessageSquare, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface PhoneVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (phone: string) => void;
  title?: string;
  description?: string;
}

type VerificationMethod = 'sms' | 'whatsapp';

export default function PhoneVerification({
  open,
  onOpenChange,
  onVerified,
  title,
  description,
}: PhoneVerificationProps) {
  const { language } = useLanguage();
  const { verifyPhone } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [method, setMethod] = useState<VerificationMethod>('sms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [demoCode, setDemoCode] = useState<string>('');

  // Normalize phone numbers to E.164. Defaults to Israel (+972) for local 0-prefixed inputs.
  function normalizePhone(input: string): string | null {
    if (!input) return null;
    let p = input.trim();
    // Convert 00xx to +xx
    if (p.startsWith('00')) p = '+' + p.slice(2);
    // Allow only digits and +
    const plus = p.startsWith('+');
    const digits = p.replace(/\D/g, '');
    if (plus) {
      // Already has country code
      return '+' + digits;
    }
    // Heuristic: local Israeli mobile like 05XXXXXXXX or other 0-prefixed local numbers
    // Default country code can be adapted; for now assume +972 based on project locale
    if (digits.startsWith('0')) {
      // Remove leading 0 and prefix +972
      return '+972' + digits.slice(1);
    }
    // If user typed bare digits without + and not starting with 0, fail validation
    return null;
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      setError('');
      setCountdown(0);
      setDemoCode('');
    }
  }, [open]);

  const handleSendOTP = async () => {
    const normalized = normalizePhone(phoneNumber);
    if (!normalized || normalized.length < 11) {
      setError('Please enter a valid phone number (e.g., 0501234567 or +972501234567)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call API to send OTP (backend expects /verify-phone with { phone, method })
      const response = await authApi.sendOTP(normalized, method);

      // Store demo code if provided (for testing)
      if (response.data?.demo_code || response.data?.data?.demo_code) {
        setDemoCode(response.data?.demo_code || response.data?.data?.demo_code);
      } else {
        // Fallback for local dev: backend accepts '123456' as valid code
        const host = (typeof window !== 'undefined' ? window.location.hostname : '');
        if (host === 'localhost' || host === '127.0.0.1') {
          setDemoCode('123456');
        }
      }

      // Persist normalized number for subsequent verify step and UI
      setPhoneNumber(normalized);
      setStep('otp');
      setCountdown(60); // 60 second countdown
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call API to verify OTP (backend expects /confirm-phone with { phone, code })
      const response = await authApi.verifyOTP(phoneNumber, otp);

      const ok = response.data?.success || response.data?.data?.verified;
      if (ok) {
        // Store auth data in AuthContext
        const token = response.data?.data?.access_token;
        const user = response.data?.data?.user;
        if (token && user) {
          verifyPhone(user, token);
        }
        onVerified(phoneNumber);
        onOpenChange(false);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    await handleSendOTP();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {title || 'Verify Your Phone Number'}
          </DialogTitle>
          <DialogDescription>
            {description || 'We need to verify your phone number to continue'}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' ? (
          <div className="space-y-4">
            {/* Verification Method Selection */}
            <div>
              <label className="mb-2 block font-medium text-sm text-[hsl(var(--foreground))]">Choose Verification Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('sms')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition ${
                    method === 'sms'
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--input))]'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('whatsapp')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition ${
                    method === 'whatsapp'
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--input))]'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label htmlFor="phone" className="font-medium text-sm text-[hsl(var(--foreground))]">Phone Number</label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., 050-1234567 or +972501234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
                disabled={loading}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                You can type local mobile like 0501234567 — we’ll send to {normalizePhone(phoneNumber) || 'international format'}
              </p>
            </div>

            {error && (
              <div className="destructive-soft text-destructive p-3 rounded-lg text-sm bg-destructive-soft">
                {error}
              </div>
            )}

            <Button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send Code via ${method === 'sms' ? 'SMS' : 'WhatsApp'}`
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-info-soft p-3 rounded-lg text-sm text-info">
              We sent a 6-digit code to <strong>{phoneNumber}</strong> via {method === 'sms' ? 'SMS' : 'WhatsApp'}
            </div>

            {/* Demo Code Display for Testing */}
            {demoCode && (
              <div className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))] p-4 rounded-xl text-primary-foreground shadow-lg border-2 border-[hsl(var(--accent))] animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1">🧪 Demo Code (Testing Only)</p>
                    <p className="text-3xl font-bold tracking-wider">{demoCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(demoCode);
                    }}
                    className="px-3 py-1.5 bg-[hsl(var(--background))] text-primary rounded-lg text-sm font-semibold hover:bg-primary-soft transition-colors"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="font-medium text-sm">Verification Code</label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                className="mt-1 text-center text-2xl tracking-widest"
                maxLength={6}
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-destructive-soft text-destructive p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Resend code in <strong>{countdown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-primary hover:underline"
                  disabled={loading}
                >
                  Didn't receive the code? Resend
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] w-full text-center"
            >
              Change phone number
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
