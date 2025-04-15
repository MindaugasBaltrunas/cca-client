import React, { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import FormInput from "../../components/InputFields/FormInput";
import Preloader from "../../components/Preloader/preloader";
import styles from "./login.module.scss";

interface LoginValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues: LoginValues = {
  email: "",
  password: "",
};

export const LoginForm: React.FC = () => {
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate(); // Add this
  
  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting, resetForm }: FormikHelpers<LoginValues>
  ) => {
    try {
      const response = await signIn(values);
      
      console.log("Login response:", response);
      
      if (response.status === "pending") {
        console.log("Two-factor authentication required.");
        
        // Navigate to the 2FA verification page, potentially with any needed data
        navigate('/verify-2fa')
      }
    } catch (error) {
      console.error("Login failed:", error);
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
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
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
                
                <button type="submit" disabled={isSubmitting || isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </button>
                
                <div className={styles.links}>
                  Not a user? <NavLink to="/signup">Sign Up</NavLink>
                </div>
                
                <div className={styles.links}>
                  <NavLink to="/forgot-password">Forgot Password?</NavLink>
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