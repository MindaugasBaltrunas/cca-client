import { FormikHelpers } from 'formik';
import { sanitizeObject } from 'xss-safe-display';
import { LoginData } from '../../../shared/types/auth.base.types';
import { useAuth } from '../context/AuthContext';
import { logger } from '../../../shared/utils/logger';
import { initialValues, validationSchema } from '../../../presentation/validation/loginValidation';


export default function useLoginForm() {
  const { signIn, isLoading } = useAuth();

  const handleSubmit = async (
    values: LoginData,
    { setSubmitting }: FormikHelpers<LoginData>
  ) => {
    try {
      const sanitized = sanitizeObject(values);
      await signIn(sanitized);
    } catch (error) {
      logger.error('Login failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    initialValues,
    validationSchema,
    handleSubmit,
    isLoading,
  } as const;
}