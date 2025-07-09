import { logger } from '../../shared/utils/logger';
import type { AuthResponse } from '../services/types';

/**
 * Centralizuotas auth error handling
 */
export const handleApiError = (error: unknown, context: string): AuthResponse => {
  logger.error(`${context}:`, error);
  
  let message = `${context} occurred`;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  return {
    status: 'error',
    message,
  };
};

/**
 * Enhanced error handling su retry logic
 */
export const handleApiErrorWithRetry = (
  error: unknown, 
  context: string, 
  retryCount: number = 0
): AuthResponse => {
  const baseError = handleApiError(error, context);
  
  if (retryCount > 0) {
    logger.warn(`${context} failed, ${retryCount} retries remaining`);
  }
  
  return baseError;
};