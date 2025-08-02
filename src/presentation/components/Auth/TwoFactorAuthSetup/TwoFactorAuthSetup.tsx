import { useNavigate, useSearchParams } from "react-router-dom";
import { useTwoFactorSetup } from "./hooks/useTwoFactorSetup";
import ErrorMessage from "./components/ErrorMessage";
import Preloader from "../../Preloader/preloader";
import SetupInstructions from "./components/SetupInstructions";
import QrCodeDisplay from "./components/QrCodeDisplay";
import VerificationForm from "./components/VerificationForm";
import styles from "./TwoFactorAuthSetup.module.scss";

const TwoFactorAuthSetup: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { 
    error, 
    isLoading, 
    isVerifying, 
    setupQrCode, 
    verifyCode, 
    clearError 
  } = useTwoFactorSetup();

  const qrCodeUrl = searchParams.get('qr');

  const handleVerifyCode = async (code: string): Promise<void> => {
    try {
      const success = await verifyCode(code);
      if (success) {
        setSearchParams({});
        navigate("/verify-2fa");
      }
    } catch (err) {
      console.error("Verification error (already handled):", err);
    }
  };

  const handleSetupQrCode = async (): Promise<void> => {
    try {      
      const qrUrl = await setupQrCode();
      
   
      if (qrUrl) {
        setSearchParams({ qr: String(qrUrl) });
      }
      
    } catch (err) {
      console.error("❌ QR setup error:", err);
      setSearchParams({}); 
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Set Up Two-Factor Authentication</h2>

      <div className={styles.content}>
        {error && <ErrorMessage message={error} onClose={clearError} />}

        <Preloader isLoading={isLoading} />

        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          margin: '10px 0', 
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong><br />
          Error: {error || 'none'}<br />
          Loading: {isLoading.toString()}<br />
          QR URL (from params): {qrCodeUrl ? 'present' : 'null'}<br />
          Should show QR: {(!error && !isLoading && !!qrCodeUrl).toString()}
        </div>

        {!isLoading && !qrCodeUrl && !error && (
          <button onClick={handleSetupQrCode} className={styles.setupButton}>
            Start Setup
          </button>
        )}

        {!error && !isLoading && qrCodeUrl && (
          <>
            <SetupInstructions />
            <QrCodeDisplay qrCodeUrl={qrCodeUrl} />
            <VerificationForm
              onSubmit={handleVerifyCode}
              isVerifying={isVerifying}
            />
          </>
        )}

        {error && !isLoading && (
          <button onClick={handleSetupQrCode} className={styles.retryButton}>
            Retry Setup
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthSetup;