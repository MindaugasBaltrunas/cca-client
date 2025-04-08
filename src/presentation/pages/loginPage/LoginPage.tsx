import React from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/InputFields/FormInput';

interface LoginValues {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const initialValues: LoginValues = {
    email: '',
    password: ''
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required')
  });

  const handleSubmit = (values: LoginValues) => {
    console.log(values);
  };

  return (
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
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;