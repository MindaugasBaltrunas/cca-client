import React from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../core/auth/context/AuthContext';
import Preloader from '../../components/Preloader/preloader';
import styles from './login.module.scss';
import { logger } from '../../../shared/utils/logger';
import { LoginState } from '../../../shared/types/api.types';
import FormInput from '../../components/InputFields/FormInput';
import { safeDisplay } from '../../../infrastructure/services';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const initialValues: LoginState = { email: '', password: '' };

export const LoginForm: React.FC = () => {
  const { signIn, isLoading } = useAuth();

  const handleSubmit = async (
    values: LoginState,
    { setSubmitting }: FormikHelpers<LoginState>
  ) => {
    try {
      await signIn(values);
    } catch (error) {
      logger.error('Login failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {isLoading && <Preloader isLoading={isLoading} />}
      <div className={styles.container}>
        <div className={styles.auth}>
          <h1>Login</h1>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <FormInput
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                <FormInput
                  name="password"
                  label="Password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
                <div className={styles.links}>
                  Not a user? <NavLink to={safeDisplay.url('/2fa-setup')}>2FA Setup</NavLink>
                </div>
                <div className={styles.links}>
                  <NavLink to={safeDisplay.url('/verify-2fa')}>Forgot Password?</NavLink>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
