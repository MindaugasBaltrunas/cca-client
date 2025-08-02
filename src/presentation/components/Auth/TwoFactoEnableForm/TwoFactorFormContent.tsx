import React from "react";
import { Form, Field } from "formik";
import { FormValues } from "./types";
import styles from "./twoFactorEnableForm.module.scss";

interface Props {
  values: FormValues;
  errors: any;
  touched: any;
  isSubmitting: boolean;
  status?: string;
  error?: string;
  isLoading: boolean;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  onCancel: () => void;
}

export const TwoFactorFormContent: React.FC<Props> = ({
  values,
  errors,
  touched,
  isSubmitting,
  status,
  error,
  isLoading,
  setFieldValue,
  onCancel,
}) => {
  const displayError = status || error;
  const isDisabled =
    isLoading ||
    isSubmitting ||
    values.verificationCode.length !== 6 ||
    !!(touched.verificationCode && errors.verificationCode);

  return (
    <>
      <div className={styles.header}>
        <h2>Enable Two-Factor Authentication</h2>
        <p>Enter the 6-digit code from your authenticator app</p>
      </div>

      {displayError && <div className={styles.errorBox}>{displayError}</div>}

      <Form noValidate>
        <div className={styles.fieldWrapper}>
          <label htmlFor="verificationCode" className={styles.label}>
            Verification Code
          </label>
          <Field name="verificationCode">
            {({ field }: any) => (
              <input
                {...field}
                id="verificationCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className={styles.verificationInput}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFieldValue("verificationCode", clean);
                }}
              />
            )}
          </Field>
          <p className={styles.helperText}>
            6-digit code from your authenticator app
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isDisabled}
            className={`${styles.button} ${
              isDisabled ? styles.disabled : styles.primary
            }`}
          >
            {isSubmitting ? "Enabling..." : "Enable 2FA"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </Form>
    </>
  );
};
