import axiosClient, { ApiHandler } from "../api/axiosClient";
import { showLoading, hideLoading } from "../store/useLoadingStore";

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export const authApi = {
  login: async (data: LoginPayload) => {
    const res = await axiosClient.post("/auth/login", data);
    ApiHandler.showSuccess("Login successfully");
    return res;
  },

  me: async () => {
    showLoading();
    const res = await axiosClient.get("/auth/me");
    hideLoading();
    return res;
  },

  refresh: (refreshToken: string, expiresInMins = 24) =>
    axiosClient.post("/auth/refresh", { refreshToken, expiresInMins }),
};
