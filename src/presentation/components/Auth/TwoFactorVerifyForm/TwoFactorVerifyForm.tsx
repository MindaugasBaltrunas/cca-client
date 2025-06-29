import React from "react";
import { Formik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { getId } from "../../../../infrastructure/services/tokenStorage";
import { validationSchema, initialValues } from "./formSchema";
import { TwoFactorFormContent } from "./TwoFactorFormContent";
import { FormValues } from "./types";
import styles from "./styles.module.scss";

interface TwoFactorVerifyFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const TwoFactorVerifyForm: React.FC<TwoFactorVerifyFormProps> = ({
  onSuccess,
  redirectTo = "/",
}) => {
  const { verifyTwoFactorAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || redirectTo;

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setFieldError, setStatus }: any
  ) => {
    try {
      setStatus(null);
      const userId = await getId();
      if (!userId) throw new Error("Session expired. Please log in again.");

      const result = await verifyTwoFactorAuth(userId, values.verificationCode);

      if (!result || result.status !== "success")
        throw new Error(result?.status || "Verification failed");

      onSuccess?.();
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.";
      if (
        message.toLowerCase().includes("invalid") ||
        message.toLowerCase().includes("incorrect")
      ) {
        setFieldError("verificationCode", message);
      } else {
        setStatus(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <TwoFactorFormContent
          isLoading={false} {...formikProps}
          // errors={error}
          // isLoading={isLoading}
          onCancel={() => navigate("/login", { replace: true })}          />
        )}
      </Formik>
    </div>
  );
};

export default TwoFactorVerifyForm;
