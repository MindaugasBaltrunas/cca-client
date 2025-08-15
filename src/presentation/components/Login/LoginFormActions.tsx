import React from "react";
import { NavLink } from "react-router-dom";
import styles from "../../styles/auth.module.scss";
import { safeDisplay } from "xss-safe-display";

export const LoginFormActions: React.FC = () => {
  return (
    <div className={styles.linksContainer}>
      <div className={styles.links}>
        <NavLink to={safeDisplay.url("/signup")}>Not a user?</NavLink>
      </div>
      <div className={styles.links}>
        <NavLink to={safeDisplay.url("/verify-2fa")}>Forgot Password?</NavLink>
      </div>
    </div>
  );
};
