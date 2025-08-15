import React from "react";
import { Formik, Form } from "formik";
import Preloader from "../../components/Preloader/preloader";
import { LoginFormActions } from "../../components/Login/LoginFormActions";
import styles from "../../styles/auth.module.scss";
import { useSignUpForm } from "../../../core/auth/hooks/useSignUpForm";
import SignUpFields from "../../components/Signup/SignupField";

const SignupPage: React.FC = () => {
  const { initialValues, validationSchema, handleSubmit, isLoading } =
    useSignUpForm();

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
            {() => (
              <Form>
                <SignUpFields />
              </Form>
            )}
          </Formik>
          <LoginFormActions />
        </div>
      </div>
    </>
  );
};

export default SignupPage;
