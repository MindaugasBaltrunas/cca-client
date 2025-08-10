import { AuthState } from "../../types/auth.types";

export const mapAuthState = (status?: string): AuthState => {
    switch (status?.toUpperCase()) {
        case "NEEDS_SETUP":
            return "NEEDS_SETUP";
        case "PENDING_VERIFICATION":
            return "PENDING_VERIFICATION";
        case "FULL_AUTH":
            return "FULL_AUTH";
        case "BASIC_AUTH":
            return "BASIC_AUTH";
        default:
            return "NO_AUTH";
    }
};
