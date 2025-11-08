import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputWithValidationProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

const InputWithValidation = React.forwardRef<
  HTMLInputElement,
  InputWithValidationProps
>(({ className, type, label, error, success, helperText, ...props }, ref) => {
  const inputId = React.useId();
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border-2 bg-[hsl(var(--background))] px-3 py-2 text-sm',
            'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            hasError && 'border-red-500 focus-visible:ring-red-500',
            hasSuccess && 'border-green-500 focus-visible:ring-green-500',
            !hasError && !hasSuccess && 'border-[hsl(var(--border))] focus-visible:ring-orange-400',
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-start gap-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1.5 text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

InputWithValidation.displayName = 'InputWithValidation';

export { InputWithValidation };
