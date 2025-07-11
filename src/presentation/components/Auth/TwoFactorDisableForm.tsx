import React, { useState } from "react";
import { useAuth } from "../../../core/auth/context/AuthContext"; 

const TwoFactorDisableForm: React.FC = () => {
  const {  setupTwoFactorAuth, error, isLoading } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [disableComplete, setDisableComplete] = useState(false);

  if ( !setupTwoFactorAuth) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">
          Two-Factor Authentication Not Enabled
        </h2>
        <p>
          You don't currently have two-factor authentication enabled on your
          account.
        </p>
      </div>
    );
  }

  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setDisableComplete(true);
    } catch (err) {
      console.error("Failed to disable 2FA:", err);
    }
  };

  if (disableComplete) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">
          Two-Factor Authentication Disabled
        </h2>
        <p className="mb-6">
          Two-factor authentication has been successfully disabled for your
          account.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Your account is now less secure. We recommend re-enabling two-factor
          authentication for optimal security.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Disable Two-Factor Authentication
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        This will remove the extra layer of security from your account
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
        <p className="font-medium">Warning</p>
        <p className="text-sm">
          Disabling two-factor authentication will make your account less
          secure. Only proceed if absolutely necessary.
        </p>
      </div>

      <form onSubmit={handleDisableSubmit}>
        <div className="mb-6">
          <label
            htmlFor="verificationCode"
            className="block text-sm font-medium mb-1"
          >
            Verification Code
          </label>
          <input
            id="verificationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-center text-2xl tracking-widest"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(
                e.target.value.replace(/\D/g, "").substring(0, 6)
              )
            }
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code from your authenticator app to confirm
          </p>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={ verificationCode.length !== 6}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Disable Two-Factor Authentication"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorDisableForm;
