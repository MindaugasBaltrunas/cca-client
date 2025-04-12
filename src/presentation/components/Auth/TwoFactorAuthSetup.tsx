import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface TwoFactorAuthSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * TwoFactorAuthSetup Component
 * Handles setting up two-factor authentication for a user account
 */
const TwoFactorAuthSetup: React.FC<TwoFactorAuthSetupProps> = ({ onSuccess, onCancel }) => {
  // Component state
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Get 2FA methods from auth context - pakeista iš useAuthenticationContext į useAuth
  const { setupTwoFactorAuth, enableTwoFactorAuth, isLoading } = useAuth();

  // Request 2FA setup data on component mount
  useEffect(() => {
    const getSetupInfo = async () => {
      try {
        const response = await setupTwoFactorAuth();
        setQrCodeUrl(response.qrCodeUrl);
        setSecretKey(response.secretKey);
      } catch (err: any) {
        setError(err.message || 'Failed to set up two-factor authentication');
      }
    };

    getSetupInfo();
  }, [setupTwoFactorAuth]);

  /**
   * Handle verification form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }

    try {
      await enableTwoFactorAuth(verificationCode);
      setIsSetupComplete(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code. Please try again.');
    }
  };

  // Setup completion message
  if (isSetupComplete) {
    return (
      <div className="two-factor-setup-complete">
        <h2>Two-Factor Authentication Enabled</h2>
        <p>Your account is now protected with two-factor authentication.</p>
        <p>You will be asked for a verification code each time you sign in.</p>
        <button onClick={onSuccess}>Continue</button>
      </div>
    );
  }

  // Main setup form
  return (
    <div className="two-factor-auth-setup">
      <h2>Set Up Two-Factor Authentication</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="setup-instructions">
        <p>Follow these steps to enable two-factor authentication:</p>
        <ol>
          <li>Install an authenticator app on your mobile device (like Google Authenticator, Authy, or Microsoft Authenticator)</li>
          <li>Scan the QR code below with your authenticator app</li>
          <li>Enter the 6-digit verification code from your authenticator app to complete setup</li>
        </ol>
      </div>
      
      {qrCodeUrl && (
        <div className="qr-code-container">
          <img src={qrCodeUrl} alt="QR Code for Two-Factor Authentication" />
          <button 
            type="button" 
            className="text-button"
            onClick={() => setShowManualEntry(!showManualEntry)}
          >
            {showManualEntry ? 'Hide' : 'Can\'t scan? Manual entry'}
          </button>
          
          {showManualEntry && secretKey && (
            <div className="manual-entry">
              <p>Enter this code manually in your authenticator app:</p>
              <div className="secret-key">{secretKey}</div>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="verificationCode">Verification Code</label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isLoading || !qrCodeUrl}>
            {isLoading ? 'Verifying...' : 'Verify and Enable'}
          </button>
          
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TwoFactorAuthSetup;