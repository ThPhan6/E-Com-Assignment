import axiosClient from "../api/axiosClient";
import { showLoading, hideLoading } from "../store/useLoadingStore";
import type { IUser } from "../types/user";
import type { TokenResponse } from "../types/auth";

export const authApi = {
  // Login user with username and password
  login: (credentials: {
    username: string;
    password: string;
    expiresInMins?: number;
  }): Promise<ApiResponse<TokenResponse>> => {
    return axiosClient.post("/auth/login", credentials);
  },

  // Get current user profile
  me: async (): Promise<ApiResponse<IUser>> => {
    showLoading();
    try {
      const response = await axiosClient.get("/auth/me");
      return response;
    } finally {
      hideLoading();
    }
  },

  // Refresh access token
  refresh: (
    refreshToken: string,
    expiresInMins: number = 24
  ): Promise<ApiResponse<TokenResponse>> => {
    return axiosClient.post("/auth/refresh", {
      refreshToken,
      expiresInMins,
    });
  },
};
