import React from "react";
import styles from "./QrCodeDisplay.module.scss";

interface QrCodeDisplayProps {
  qrCodeUrl: string;
  secretKey?: string;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ 
  qrCodeUrl, 
  secretKey 
}) => {
  return (
    <div className={styles.container}>
      <img
        src={qrCodeUrl}
        alt="QR Code for Two-Factor Authentication"
        className={styles.qrImage}
      />
      
      {secretKey && (
        <div className={styles.manualKeySection}>
          <strong className={styles.manualKeyLabel}>Manual Entry Key:</strong>
          <div
            className={styles.manualKeyCode}
            tabIndex={0}
            title="Click to select all text"
          >
            {secretKey}
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodeDisplay;