import axiosClient from "../api/axiosClient";
import { showLoading, hideLoading } from "../store/useLoadingStore";

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export const authApi = {
  login: (data: LoginPayload) => axiosClient.post("/auth/login", data),

  me: async () => {
    showLoading();
    const res = await axiosClient.get("/auth/me");
    hideLoading();
    return res;
  },

  refresh: (refreshToken: string, expiresInMins = 30) =>
    axiosClient.post("/auth/refresh", { refreshToken, expiresInMins }),
};
