/**
 * Centralized Error Handling Utilities
 */

import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  field?: string;
}

export class AppError extends Error {
  status: number;
  code?: string;
  field?: string;

  constructor(message: string, status: number = 500, code?: string, field?: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

/**
 * Parse error from various sources (API response, Error object, string)
 */
export function parseError(error: any): ApiError {
  // Axios error response
  if (error.response) {
    const data = error.response.data;
    return {
      message: data?.detail || data?.message || 'An error occurred',
      status: error.response.status,
      code: data?.code,
      field: data?.field,
    };
  }

  // Network error
  if (error.request) {
    return {
      message: 'Network error. Please check your internet connection.',
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  // AppError instance
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      field: error.field,
    };
  }

  // Standard Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error,
      status: 500,
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}

/**
 * Get user-friendly error message based on status code
 */
export function getErrorMessage(error: any): string {
  const parsedError = parseError(error);
  const { message, status } = parsedError;

  // Use the error message if it's user-friendly
  if (message && !message.includes('500') && !message.includes('Internal Server Error')) {
    return message;
  }

  // Fallback messages based on status code
  switch (status) {
    case 0:
      return 'Unable to connect. Please check your internet connection.';
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This item already exists or conflicts with existing data.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Handle error with toast notification
 */
export function handleError(error: any, customMessage?: string): void {
  const errorMessage = customMessage || getErrorMessage(error);
  toast.error(errorMessage, {
    duration: 5000,
    icon: '❌',
  });

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }
}

/**
 * Retry failed async operation
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  onRetry?: (attempt: number) => void
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt);
        }
        
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Wrap async operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string,
  onSuccess?: (result: T) => void,
  onError?: (error: any) => void
): Promise<T | null> {
  try {
    const result = await operation();
    if (onSuccess) {
      onSuccess(result);
    }
    return result;
  } catch (error) {
    handleError(error, errorMessage);
    if (onError) {
      onError(error);
    }
    return null;
  }
}

/**
 * Validate response and throw error if invalid
 */
export function validateResponse(response: any): void {
  if (!response) {
    throw new AppError('No response received from server', 500);
  }

  if (response.error) {
    throw new AppError(response.error, response.status || 500);
  }

  if (!response.ok && response.status) {
    throw new AppError(
      response.statusText || 'Request failed',
      response.status
    );
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const parsedError = parseError(error);
  const { status, code } = parsedError;

  // Retry on network errors
  if (status === 0 || code === 'NETWORK_ERROR') {
    return true;
  }

  // Retry on server errors (5xx)
  if (status && status >= 500) {
    return true;
  }

  // Retry on rate limiting (with backoff)
  if (status === 429) {
    return true;
  }

  return false;
}

/**
 * Log error to external service (e.g., Sentry, LogRocket)
 */
export function logError(error: any, context?: Record<string, any>): void {
  const parsedError = parseError(error);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', { error: parsedError, context });
  }

  // Send to error tracking service
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { contexts: { custom: context } });
  // }
}
