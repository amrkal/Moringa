"use client";

import * as React from 'react';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PaymentStatusState = 'idle' | 'pending' | 'success' | 'error';

export interface PaymentStatusProps {
  status: PaymentStatusState;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * PaymentStatus Component
 * 
 * Displays payment verification status with three states:
 * - idle: No status message (before submit)
 * - pending: Neutral banner with spinner ("Verifying payment...")
 * - success: Green banner after successful verification
 * - error: Red banner after failed verification with retry button
 * 
 * Includes ARIA live regions for accessibility
 */
export function PaymentStatus({ status, message, onRetry, className }: PaymentStatusProps) {
  // Don't render anything in idle state
  if (status === 'idle') {
    return null;
  }

  const configs = {
    pending: {
      icon: Loader2,
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-900 dark:text-blue-100',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconClassName: 'animate-spin',
      defaultMessage: 'Verifying payment...',
      ariaLive: 'polite' as const,
    },
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-900 dark:text-green-100',
      iconColor: 'text-green-600 dark:text-green-400',
      iconClassName: '',
      defaultMessage: 'Payment verified successfully!',
      ariaLive: 'assertive' as const,
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-900 dark:text-red-100',
      iconColor: 'text-red-600 dark:text-red-400',
      iconClassName: '',
      defaultMessage: 'Payment verification failed',
      ariaLive: 'assertive' as const,
    },
  };

  const config = configs[status];
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 transition-all duration-300',
        config.bgColor,
        config.borderColor,
        className
      )}
      role="status"
      aria-live={config.ariaLive}
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <Icon 
          className={cn(
            'h-5 w-5 mt-0.5 flex-shrink-0',
            config.iconColor,
            config.iconClassName
          )} 
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', config.textColor)}>
            {displayMessage}
          </p>
          {status === 'error' && onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className={cn(
                  'border-red-300 dark:border-red-700',
                  'hover:bg-red-100 dark:hover:bg-red-900/50',
                  'text-red-700 dark:text-red-300'
                )}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
