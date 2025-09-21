import axiosClient, { ApiHandler } from "../api/axiosClient";
import { showLoading, hideLoading } from "../store/useLoadingStore";
import type { TokenResponse } from "../types/auth";
import type { IUser } from "../types/user";

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export const authApi = {
  login: async (data: LoginPayload): ApiResponse<TokenResponse> => {
    const res = await axiosClient.post("/auth/login", data);
    if (res.status === 200) {
      ApiHandler.showSuccess("Login successfully");
    }
    return res;
  },

  me: async (): ApiResponse<IUser> => {
    showLoading();
    const res = await axiosClient.get("/auth/me");
    hideLoading();
    return res;
  },

  refresh: (
    refreshToken: string,
    expiresInMins = 24
  ): ApiResponse<TokenResponse> =>
    axiosClient.post("/auth/refresh", { refreshToken, expiresInMins }),
};
