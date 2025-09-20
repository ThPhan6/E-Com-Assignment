import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { IUser } from "../types/user";

interface DecodedToken {
  exp: number; // unix timestamp
}

interface AuthState {
  user: IUser | null;
  setUser: (user: IUser) => void;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
  isTokenExpiring: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
  isTokenExpiring: () => {
    const token = get().accessToken;
    if (!token) return true;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      // refresh if less than 1 min left
      return decoded.exp - now < 60;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      return true;
    }
  },
}));
