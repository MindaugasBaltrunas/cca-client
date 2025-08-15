import { useState } from 'react';
import { FormikHelpers } from 'formik';
import { sanitizeObject } from 'xss-safe-display';
import { logger } from '../../../shared/utils/logger';

export function useAuthForm<T>(authFunction: (data: T) => Promise<any>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    values: T,
    { setSubmitting }: FormikHelpers<T>
  ) => {
    setIsLoading(true);
    setSubmitting(true);
    try {
      const sanitized = sanitizeObject(values);
      await authFunction(sanitized);
    } catch (error) {
      logger.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
  };
}