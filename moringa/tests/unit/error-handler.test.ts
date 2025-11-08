import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseError,
  getErrorMessage,
  AppError,
  retryOperation,
  isRetryableError,
} from '@/lib/error-handler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create AppError instance', () => {
      const error = new AppError('Test error', 400, 'TEST_CODE', 'email');
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('TEST_CODE');
      expect(error.field).toBe('email');
      expect(error.name).toBe('AppError');
    });

    it('should use default status 500', () => {
      const error = new AppError('Test error');
      expect(error.status).toBe(500);
    });
  });

  describe('parseError', () => {
    it('should parse Axios error response', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            detail: 'Validation failed',
            code: 'VALIDATION_ERROR',
            field: 'email',
          },
        },
      };

      const parsed = parseError(axiosError);
      expect(parsed.message).toBe('Validation failed');
      expect(parsed.status).toBe(400);
      expect(parsed.code).toBe('VALIDATION_ERROR');
      expect(parsed.field).toBe('email');
    });

    it('should parse Axios error with message property', () => {
      const axiosError = {
        response: {
          status: 404,
          data: {
            message: 'Not found',
          },
        },
      };

      const parsed = parseError(axiosError);
      expect(parsed.message).toBe('Not found');
      expect(parsed.status).toBe(404);
    });

    it('should parse network error', () => {
      const networkError = {
        request: {},
      };

      const parsed = parseError(networkError);
      expect(parsed.message).toBe('Network error. Please check your internet connection.');
      expect(parsed.status).toBe(0);
      expect(parsed.code).toBe('NETWORK_ERROR');
    });

    it('should parse AppError instance', () => {
      const appError = new AppError('Custom error', 403, 'FORBIDDEN');
      const parsed = parseError(appError);
      
      expect(parsed.message).toBe('Custom error');
      expect(parsed.status).toBe(403);
      expect(parsed.code).toBe('FORBIDDEN');
    });

    it('should parse standard Error object', () => {
      const standardError = new Error('Standard error message');
      const parsed = parseError(standardError);
      
      expect(parsed.message).toBe('Standard error message');
      expect(parsed.status).toBe(500);
    });

    it('should parse string error', () => {
      const parsed = parseError('String error');
      expect(parsed.message).toBe('String error');
      expect(parsed.status).toBe(500);
    });

    it('should handle unknown error', () => {
      const parsed = parseError({ unknown: 'object' });
      expect(parsed.message).toBe('An unexpected error occurred');
      expect(parsed.status).toBe(500);
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message from error', () => {
      const error = {
        response: {
          status: 400,
          data: { detail: 'Email is already registered' },
        },
      };

      expect(getErrorMessage(error)).toBe('Email is already registered');
    });

    it('should return fallback for 400 status', () => {
      const error = {
        response: {
          status: 400,
          data: { detail: 'Internal Server Error' }, // Generic message that triggers fallback
        },
      };

      expect(getErrorMessage(error)).toBe('Invalid request. Please check your input.');
    });

    it('should return fallback for 401 status', () => {
      const error = { response: { status: 401, data: { detail: 'Internal Server Error' } } };
      expect(getErrorMessage(error)).toBe('Authentication required. Please log in.');
    });

    it('should return fallback for 403 status', () => {
      const error = { response: { status: 403, data: { detail: '500' } } };
      expect(getErrorMessage(error)).toBe('You do not have permission to perform this action.');
    });

    it('should return fallback for 404 status', () => {
      const error = { response: { status: 404, data: { detail: '500' } } };
      expect(getErrorMessage(error)).toBe('The requested resource was not found.');
    });

    it('should return fallback for 409 status', () => {
      const error = { response: { status: 409, data: { detail: '500' } } };
      expect(getErrorMessage(error)).toBe('This item already exists or conflicts with existing data.');
    });

    it('should return fallback for 422 status', () => {
      const error = { response: { status: 422, data: { detail: '500' } } };
      expect(getErrorMessage(error)).toBe('Validation error. Please check your input.');
    });

    it('should return fallback for 429 status', () => {
      const error = { response: { status: 429, data: { detail: '500' } } };
      expect(getErrorMessage(error)).toBe('Too many requests. Please try again later.');
    });

    it('should return fallback for 500 status', () => {
      const error = { response: { status: 500, data: { detail: '500' } } };
      expect(getErrorMessage(error)).toBe('Server error. Please try again later.');
    });

    it('should return fallback for 503 status', () => {
      const error = { response: { status: 503, data: { detail: 'Internal Server Error' } } };
      expect(getErrorMessage(error)).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('should return fallback for network error', () => {
      const error = { request: {} };
      expect(getErrorMessage(error)).toBe('Network error. Please check your internet connection.');
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await retryOperation(operation, 3, 10);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');

      const result = await retryOperation(operation, 3, 10);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(retryOperation(operation, 2, 10)).rejects.toThrow('Always fails');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockResolvedValue('success');
      
      const onRetry = vi.fn();
      await retryOperation(operation, 3, 10, onRetry);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1);
    });

    it('should use exponential backoff', async () => {
      vi.useFakeTimers();
      
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const promise = retryOperation(operation, 3, 100);
      
      // Fast-forward through delays
      await vi.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toBe('success');
      
      vi.useRealTimers();
    });
  });

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const error = { request: {} };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for 5xx errors', () => {
      expect(isRetryableError({ response: { status: 500, data: {} } })).toBe(true);
      expect(isRetryableError({ response: { status: 502, data: {} } })).toBe(true);
      expect(isRetryableError({ response: { status: 503, data: {} } })).toBe(true);
    });

    it('should return true for 429 rate limiting', () => {
      const error = { response: { status: 429, data: {} } };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for 4xx client errors', () => {
      expect(isRetryableError({ response: { status: 400, data: {} } })).toBe(false);
      expect(isRetryableError({ response: { status: 401, data: {} } })).toBe(false);
      expect(isRetryableError({ response: { status: 404, data: {} } })).toBe(false);
    });

    it('should return false for successful responses', () => {
      expect(isRetryableError({ response: { status: 200, data: {} } })).toBe(false);
    });
  });
});
