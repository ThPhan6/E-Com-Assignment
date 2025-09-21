import { PATH } from "../lib/route";
import { isTokenValid } from "./tokenHelper";

/**
 * Centralized authentication guard that checks localStorage token
 * and redirects to 403 page if authentication fails
 * @returns true if authenticated, false if not (and redirects to 403)
 */
export const requireAuth = (): boolean => {
  // Check both accessToken and refreshToken from localStorage
  const accessToken = localStorage.getItem("accessToken");

  // Use helper function to validate tokens
  if (!isTokenValid(accessToken)) {
    // Redirect to 403 page which has a button to go to login
    window.location.href = PATH.ERROR_403;
    return false;
  }

  return true;
};
