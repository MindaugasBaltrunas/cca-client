import { useAuthState } from "../../../core/auth/hooks/useAuthState";
import { logger } from "../../../shared/utils/logger";

const ProfilePage: React.FC = () => {
  const { tokenData } = useAuthState();
  // logger.debug("tokenData", tokenData);
  return (
    <div>
      <h1>My Profile</h1>
      <p>Welcome to your profile page!</p>
    </div>
  );
};

export default ProfilePage;
