import React from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/InputFields/FormInput';
import { NavLink } from 'react-router-dom'; // Corrected from 'react-router'
import style from './login.module.scss';
import { useAuth } from '../../../context/AuthContext';
// import TwoFactorAuthSetup from '../../components/Auth/TwoFactorAuthSetup'; // Adjust the import path as necessary

interface LoginValues {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const initialValues: LoginValues = {
    email: '',
    password: ''
  };

  const { signIn, isLoading } = useAuth();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required')
  });

  const handleSubmit = async (values: LoginValues) => {
    // "email": "johns.doe.0@example.com",
    // "password": "Password123@",
    // "role": "user"
    const response = await signIn({ email: "johns.doe.0@example.com", password: "Password123@", role: "user" });
    console.log(response);
  };

  return (
    <div className={style.container}>
       {/* <TwoFactorAuthSetup /> */}
      <div className={style.auth}>
        <h1>Login</h1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <FormInput
                name="email"
                label="Email"
                type="email"
                required
                placeholder="Enter your email"
              />
              <FormInput
                name="password"
                label="Password"
                type="password"
                required
                placeholder="Enter your password"
              />
              <button type="submit">Login</button>
              <div className={style.links}>
                Not a user?
                <NavLink to="/signup">
                  Sign Up
                </NavLink>
              </div>
              <div className={style.links}>
                <NavLink to="/forgot-password">
                  Forgot Password?
                </NavLink>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginForm;