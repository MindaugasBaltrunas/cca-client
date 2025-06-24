import React, { useEffect } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getId } from "../../../infrastructure/services/tokenStorage";
import { logger } from "../../../shared/utils/logger";
import FormInput from "../InputFields/FormInput";

interface TwoFactorVerifyFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

interface FormValues {
  verificationCode: string;
}

// Validation schema
const validationSchema = Yup.object({
  verificationCode: Yup.string()
    .required("Verification code is required")
    .matches(/^\d{6}$/, "Verification code must be exactly 6 digits")
    .length(6, "Verification code must be exactly 6 digits"),
});

// Component to handle input enhancement after FormInput renders
const VerificationCodeEnhancer: React.FC = () => {
  const { setFieldValue, values } = useFormikContext<FormValues>();

  useEffect(() => {
    const input = document.getElementById(
      "verificationCode"
    ) as HTMLInputElement;
    if (input) {
      // Apply styling for better UX
      input.style.textAlign = "center";
      input.style.fontSize = "1.5rem";
      input.style.letterSpacing = "0.5rem";
      input.style.fontWeight = "600";
      input.style.padding = "12px";

      // Set attributes
      input.setAttribute("inputmode", "numeric");
      input.setAttribute("maxlength", "6");
      input.focus();

      // Handle input to only allow digits
      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const rawValue = target.value;
        const cleanValue = rawValue.replace(/\D/g, "").substring(0, 6);

        if (cleanValue !== rawValue) {
          // Use Formik's setFieldValue to properly update the form state
          setFieldValue("verificationCode", cleanValue, true);
        }
      };

      input.addEventListener("input", handleInput);

      // Cleanup
      return () => {
        input.removeEventListener("input", handleInput);
      };
    }
  }, [setFieldValue]);

  return null; // This component doesn't render anything
};

const TwoFactorVerifyForm: React.FC<TwoFactorVerifyFormProps> = ({
  onSuccess,
  redirectTo = "/",
}) => {
  const { error, isLoading, verifyTwoFactorAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get intended destination from navigation state or use default
  const from = location.state?.from?.pathname || redirectTo;

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setFieldError, setStatus }: any
  ) => {
    try {
      setStatus(null); // Clear any previous status messages

      const userId = await getId();

      if (!userId) {
        throw new Error("Session expired. Please log in again.");
      }

      logger.info("Starting 2FA verification");

      // Call the verification function and wait for completion
      const result = await verifyTwoFactorAuth(userId, values.verificationCode);

      // If verification returns a result, handle it appropriately
      if (result && result.status !== "success") {
        throw new Error(result.status || "Verification failed");
      }

      logger.info("2FA verification successful");

      // Navigate directly after successful verification
      onSuccess?.();
      navigate(from, { replace: true });
    } catch (err) {
      logger.error("2FA verification failed:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.";

      // Check if it's a field-specific error or general error
      if (
        errorMessage.includes("invalid code") ||
        errorMessage.includes("incorrect")
      ) {
        setFieldError("verificationCode", errorMessage);
      } else {
        setStatus(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    logger.info("2FA verification cancelled");
    navigate("/login", { replace: true });
  };

  const initialValues: FormValues = {
    verificationCode: "",
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Two-Factor Authentication
        </h2>
        <p className="text-gray-600">
          Please enter the verification code from your authenticator app
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isSubmitting, values, status, errors, touched }) => {
          // Show auth context error, form status, or field errors
          const displayError = error || status;
          const isFormDisabled = isLoading || isSubmitting;

          return (
            <>
              {/* Enhancement component that doesn't render but enhances the input */}
              <VerificationCodeEnhancer />

              {displayError && (
                <div
                  className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md"
                  role="alert"
                  aria-live="polite"
                >
                  {displayError instanceof Error
                    ? displayError.message
                    : displayError}
                </div>
              )}

              <Form noValidate>
                <div className="mb-6">
                  <FormInput
                    name="verificationCode"
                    label="Verification Code"
                    type="text"
                    required
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />

                  <p className="text-sm text-gray-500 mt-2">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={
                      isFormDisabled ||
                      values.verificationCode.length !== 6 ||
                      (touched.verificationCode && !!errors.verificationCode)
                    }
                    className={`
                      flex-1 py-3 px-4 rounded-md font-medium text-white
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        isFormDisabled ||
                        values.verificationCode.length !== 6 ||
                        (touched.verificationCode && !!errors.verificationCode)
                          ? "bg-gray-400"
                          : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isFormDisabled}
                    className="
                      flex-1 py-3 px-4 rounded-md font-medium text-gray-700 bg-gray-100 
                      hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    Cancel
                  </button>
                </div>
              </Form>

              {/* Additional help text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Can't access your authenticator app?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-500 underline focus:outline-none"
                    onClick={() => {
                      // Handle backup codes or alternative verification
                      console.log("Show backup verification options");
                    }}
                  >
                    Use backup method
                  </button>
                </p>
              </div>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

export default TwoFactorVerifyForm;
