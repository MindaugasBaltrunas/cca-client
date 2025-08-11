import React from "react";
import { Formik, Form } from "formik";
import useLoginForm from "../../../core/auth/hooks/useLoginForm";
import Preloader from "../../components/Preloader/preloader";
import LoginFields from "../../components/Login/LoginFields";
import { LoginFormActions } from "../../components/Login/LoginFormActions";
import styles from "../../styles/auth.module.scss";

const LoginPage: React.FC = () => {
  const { initialValues, validationSchema, handleSubmit, isLoading } =
    useLoginForm();

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
                <LoginFields />
              </Form>
            )}
          </Formik>
          <LoginFormActions />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
