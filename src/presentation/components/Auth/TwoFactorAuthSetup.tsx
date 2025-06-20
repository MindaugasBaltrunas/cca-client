import React, { useState } from "react";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from "../../../context/AuthContext";
import { useAccessToken } from "../../../core/hooks/useAccessToken";
import { logger } from "../../../shared/utils/logger";
import FormInput from "../InputFields/FormInput";

interface TwoFactorFormValues {
  verificationCode: string;
}

const TwoFactorAuthSetup: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { setupTwoFactorAuth } = useAuth();
  const { fetchToken } = useAccessToken();

  // Validation schema for the verification code
  const validationSchema = Yup.object({
    verificationCode: Yup.string()
      .matches(/^\d{6}$/, 'Must be exactly 6 digits')
      .required('Verification code is required')
  });

  // Initial form values
  const initialValues: TwoFactorFormValues = {
    verificationCode: ''
  };

  if (!started) {
    setStarted(true);

    (async () => {
      try {
        const token = await fetchToken();
        if (!token) {
          throw new Error("Please log in to set up two-factor authentication.");
        }

        const response = await setupTwoFactorAuth();
        setQrCodeUrl(response.qrCodeUrl);
      } catch (err: any) {
        logger.error("2FA setup error", err);
        setError(err.message || "Failed to set up two-factor authentication");
      }
    })();
  }

  const handleSubmit = async (values: TwoFactorFormValues, { setFieldError, resetForm }: any) => {
    setIsVerifying(true);
    setError(null);

    try {
      // Replace this with your actual verification API call
      // const result = await verifyTwoFactorSetup(values.verificationCode);
      console.log("Verifying code:", values.verificationCode);
      
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle successful verification
      alert("Two-factor authentication setup completed successfully!");
      resetForm();
      
    } catch (err: any) {
      logger.error("2FA verification error", err);
      
      // Set error on the specific field
      if (err.message?.includes('invalid') || err.message?.includes('code')) {
        setFieldError('verificationCode', 'Invalid verification code. Please try again.');
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="two-factor-auth-setup">
      <h2>Set Up Two-Factor Authentication</h2>

      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#fee",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {!error && !qrCodeUrl && <p>Generating QR code...</p>}

      {!error && qrCodeUrl && (
        <>
          <ol>
            <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Scan the QR code below or enter the manual key</li>
            <li>Enter the 6-digit code from your authenticator app</li>
          </ol>

          <img
            src={qrCodeUrl}
            alt="QR Code for Two-Factor Authentication"
            style={{ maxWidth: "100%", height: "auto", marginTop: "15px" }}
          />

          {/* {secretKey && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              <strong>Manual Entry Key:</strong>
              <div
                style={{
                  display: "block",
                  padding: "8px",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  marginTop: "5px",
                  fontSize: "14px"
                }}
              >
                {secretKey}
              </div>
            </div>
          )} */}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isValid }) => (
              <Form style={{ marginTop: "20px" }}>
                <div style={{ marginBottom: "20px" }}>
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
                  disabled={!isValid || values.verificationCode.length !== 6 || isVerifying}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isValid && values.verificationCode.length === 6 ? "#007bff" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isValid && values.verificationCode.length === 6 ? "pointer" : "not-allowed",
                  }}
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                </button>
                
                {isVerifying && (
                  <div style={{ marginTop: "10px", color: "#666" }}>
                    Verifying your code...
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default TwoFactorAuthSetup;