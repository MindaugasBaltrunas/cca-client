import { AuthState } from "../../../../shared/types/auth.base.types";

export const mapAuthState = (status: string | undefined): AuthState => {
  if (!status) {
    return "NO_AUTH";
  }

  switch (status.toLowerCase()) {
    case "verified":
    case "full_auth":
      return "FULL_AUTH";
    case "basic_auth":
    case "authenticated":
      return "BASIC_AUTH";
    case "pending_verification":
    case "pending":
      return "PENDING_VERIFICATION";
    case "needs_setup":
    case "setup_required":
      return "NEEDS_SETUP";
    case "no_auth":
    case "unauthenticated":
    default:
      return "NO_AUTH";
  }
};