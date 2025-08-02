import React from "react";
import { Formik, Form } from "formik";
import FormInput from "../../../InputFields/FormInput"; 
import { 
  TwoFactorFormValues, 
  twoFactorValidationSchema, 
  initialFormValues 
} from "../validation/twoFactorValidation";
import styles from "./VerificationForm.module.scss";

interface VerificationFormProps {
  onSubmit: (code: string) => Promise<void>;
  isVerifying: boolean;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ 
  onSubmit, 
  isVerifying 
}) => {
  const handleSubmit = async (
    values: TwoFactorFormValues,
    { setFieldError }: any
  ) => {
    try {
      await onSubmit(values.verificationCode);
    } catch (error: any) {
      setFieldError("verificationCode", error.message);
    }
  };

  const isButtonEnabled = (isValid: boolean, verificationCode: string) => {
    return isValid && verificationCode.length === 6 && !isVerifying;
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={twoFactorValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, isValid }) => (
        <Form className={styles.form}>
          <div className={styles.inputContainer}>
            <FormInput
              name="verificationCode"
              label="Verification Code"
              type="text"
              required
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={!isButtonEnabled(isValid, values.verificationCode)}
            className={`${styles.submitButton} ${
              isButtonEnabled(isValid, values.verificationCode) 
                ? styles.enabled 
                : styles.disabled
            }`}
          >
            {isVerifying ? "Verifying..." : "Verify Code"}
          </button>

          {isVerifying && (
            <div className={styles.verifyingMessage}>
              Verifying your code...
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default VerificationForm;