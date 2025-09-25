import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { PATH } from "../lib/route";
import { ApiHandler } from "../api/axiosClient";

/**
 * Custom hook for authentication operations
 * Provides login, logout, and authentication state management
 */
export const useLogin = () => {
  const { login, logout, isAuthenticated, user, accessToken, refreshToken } =
    useAuthStore();
  const navigate = useNavigate();

  /**
   * Handle user login with credentials
   * @param credentials - Username and password
   */
  const handleLogin = async (credentials: {
    username: string;
    password: string;
  }) => {
    await login(credentials);
    return { success: true };
  };

  /**
   * Handle user logout
   * Clears tokens and redirects to login page
   */
  const handleLogout = () => {
    logout();
    navigate(PATH.LOGIN, { replace: true });
    ApiHandler.showSuccess("Logged out successfully");
  };

  /**
   * Check if user is currently authenticated
   * @returns boolean indicating authentication status
   */
  const checkAuthStatus = (): boolean => {
    return isAuthenticated();
  };

  /**
   * Get current user information
   * @returns user object or null
   */
  const getCurrentUser = () => {
    return user;
  };

  /**
   * Get authentication tokens
   * @returns object with access and refresh tokens
   */
  const getTokens = () => {
    return {
      accessToken,
      refreshToken,
    };
  };

  return {
    // State
    isAuthenticated: checkAuthStatus,
    user: getCurrentUser(),
    tokens: getTokens(),

    // Actions
    login: handleLogin,
    logout: handleLogout,
  };
};
