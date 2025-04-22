import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const TwoFactorAuthSetup: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const { setupTwoFactorAuth, twoFactorLoginState } = useAuth();

  if (!hasFetched) {
    setHasFetched(true);
    setupTwoFactorAuth()
      .then((response) => {
        setQrCodeUrl(response.qrCodeUrl);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load QR code");
      });
  }

  return (
    <div className="two-factor-auth-setup">
      <h2>Set Up Two-Factor Authentication</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="setup-instructions">
        <p>Follow these steps to enable two-factor authentication:</p>
        <ol>
          <li>
            Install an authenticator app (Google Authenticator, Authy, etc.)
          </li>
          <li>Scan the QR code below</li>
          <li>Enter the 6-digit code when asked</li>
        </ol>
      </div>

      {qrCodeUrl ? (
        <div className="qr-code-container">
          <img src={qrCodeUrl} alt="QR Code for Two-Factor Authentication" />
          <button
            type="button"
            className="text-button"
            onClick={() => setShowManualEntry(!showManualEntry)}
          >
            {showManualEntry ? "Hide manual entry" : "Can't scan? Manual entry"}
          </button>
        </div>
      ) : (
        <p>Loading QR code...</p>
      )}
    </div>
  );
};

export default TwoFactorAuthSetup;
