import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TwoFactorVerifyForm: React.FC = () => {
  const { verifyTwoFactorAuth, twoFactorLoginState, error, isLoading } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

  // Redirect to login if there’s no pending two-factor login state.
  useEffect(() => {
    if (!twoFactorLoginState) {
      navigate('/login');
    }
  }, [twoFactorLoginState, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorLoginState?.userId) return;

    try {
      await verifyTwoFactorAuth(twoFactorLoginState.userId, verificationCode);
      navigate('/dashboard');
    } catch (err) {
      console.error('2FA verification failed:', err);
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Two-Factor Authentication</h2>
      <p className="text-gray-600 mb-6 text-center">
        Please enter the verification code from your authenticator app
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="code" className="block text-sm font-medium mb-1">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-center text-2xl tracking-widest"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))
            }
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorVerifyForm;
