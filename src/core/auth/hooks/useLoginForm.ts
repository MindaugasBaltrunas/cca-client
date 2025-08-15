import { LoginData } from '../../../shared/types/auth.base.types';
import { useAuth } from '../context/AuthContext';
import { useAuthForm } from './useAuthForm';
import { initialValues, validationSchema } from '../../../presentation/validation/loginValidation';

export default function useLoginForm() {
  const { signIn } = useAuth();
  const { handleSubmit, isLoading } = useAuthForm<LoginData>(signIn);

  return {
    initialValues,
    validationSchema,
    handleSubmit,
    isLoading,
  } as const;
}