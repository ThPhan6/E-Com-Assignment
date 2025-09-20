import axiosClient from "../api/axiosClient";

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export const authApi = {
  login: (data: LoginPayload) => axiosClient.post("/auth/login", data),

  me: () => axiosClient.get("/auth/me"),

  refresh: (refreshToken: string, expiresInMins = 30) =>
    axiosClient.post("/auth/refresh", { refreshToken, expiresInMins }),
};
