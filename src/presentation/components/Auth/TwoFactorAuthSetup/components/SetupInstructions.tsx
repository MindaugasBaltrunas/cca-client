import React from "react";
import styles from "./SetupInstructions.module.scss";

const SetupInstructions: React.FC = () => {
  return (
    <ol className={styles.instructionsList}>
      <li>
        Install an <span className={styles.highlight}>authenticator app</span> (Google Authenticator, Authy, etc.)
      </li>
      <li>
        <span className={styles.highlight}>Scan the QR code</span> below or enter the manual key
      </li>
      <li>
        Enter the <span className={styles.highlight}>6-digit code</span> from your authenticator app
      </li>
    </ol>
  );
};

export default SetupInstructions;