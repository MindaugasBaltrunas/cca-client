import React from "react";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../core/auth/context/AuthContext";
import { validationSchema, initialValues } from "./formSchema";
import { TwoFactorFormContent } from "./TwoFactorFormContent";
import { FormValues } from "./types";
import styles from "./twoFactorEnableForm.module.scss";

interface TwoFactorEnableFormProps {
  onSuccess?: () => void;
}

const TwoFactorEnableForm: React.FC<TwoFactorEnableFormProps> = ({
  onSuccess,
}) => {
  const { enableTwoFactorAuth, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setFieldError, setStatus }: any
  ) => {
    try {
      setStatus(null);
      const result = await enableTwoFactorAuth(values.verificationCode);

      if (!result || result.status !== "success")
        throw new Error(result?.message || "Enable failed");

      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
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
            isLoading={isLoading}
            {...formikProps}
            errors={error}
            onCancel={() => navigate("/settings")}
          />
        )}
      </Formik>
    </div>
  );
};

export default TwoFactorEnableForm;
