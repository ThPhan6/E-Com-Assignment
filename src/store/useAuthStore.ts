import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../service/auth.api";
import { isTokenValid } from "../lib/tokenHelper";
import type { IUser } from "../types/user";

interface AuthState {
  // Core authentication state
  isAuthenticated: () => boolean;
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  setUser: (user: IUser) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,

      // Check if user is authenticated
      isAuthenticated: () => {
        const { accessToken } = get();
        return isTokenValid(accessToken);
      },

      // Set tokens and persist to localStorage
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      // Clear all authentication data
      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      },

      // Set user data
      setUser: (user: IUser) => {
        set({ user });
      },

      // Login user with credentials
      login: async (credentials: { username: string; password: string }) => {
        try {
          const response = await authApi.login(credentials);
          const { accessToken, refreshToken } = response.data;

          // Store tokens
          get().setTokens(accessToken, refreshToken);

          // Fetch user profile
          await get().getCurrentUser();
        } catch (error) {
          // Clear any partial state on error
          get().clearTokens();
          throw error;
        }
      },

      // Logout user
      logout: () => {
        get().clearTokens();
      },

      // Refresh access token using refresh token
      refreshAccessToken: async (): Promise<boolean> => {
        const { refreshToken } = get();

        if (!refreshToken || !isTokenValid(refreshToken)) {
          get().clearTokens();
          return false;
        }

        try {
          const response = await authApi.refresh(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          get().setTokens(accessToken, newRefreshToken);
          return true;
        } catch {
          get().clearTokens();
          return false;
        }
      },

      // Get current user profile
      getCurrentUser: async () => {
        try {
          const response = await authApi.me();
          get().setUser(response.data);
        } catch (error) {
          // If getting user fails, clear tokens
          get().clearTokens();
          throw error;
        }
      },

      // Reset store to initial state
      reset: () => {
        get().clearTokens();
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
