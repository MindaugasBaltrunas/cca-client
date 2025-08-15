import { initialValues, validationSchema } from '../../../presentation/validation/signupValidation';
import { SignUpData } from '../../../shared/types/auth.base.types';
import { useAuth } from '../context/AuthContext';
import { useAuthForm } from './useAuthForm';

export function useSignUpForm() {
    const { signUp } = useAuth();
    const { handleSubmit, isLoading } = useAuthForm<SignUpData>(signUp);

    return {
        initialValues: initialValues,
        validationSchema: validationSchema,
        handleSubmit,
        isLoading,
    };
}