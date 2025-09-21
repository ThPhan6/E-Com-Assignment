import { create } from "zustand";
import type { IUser } from "../types/user";
import { isTokenValid } from "../lib/tokenHelper";

interface AuthState {
  user: IUser | null;
  setUser: (user: IUser) => void;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ accessToken, refreshToken });
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ accessToken: null, refreshToken: null });
  },
  isAuthenticated: () => {
    // Check both accessToken and refreshToken from localStorage
    const accessToken = localStorage.getItem("accessToken");
    return isTokenValid(accessToken);
  },
  reset: () => {
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
