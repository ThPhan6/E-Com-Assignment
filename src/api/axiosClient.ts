import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const api = axios.create({ baseURL: "https://dummyjson.com" });
api.interceptors.request.use(async (config) => {
  const { accessToken, refreshToken, isTokenExpiring, setTokens, clearTokens } =
    useAuthStore.getState();

  if (accessToken && config.headers) {
    if (isTokenExpiring() && refreshToken) {
      try {
        const { data } = await axios.post(
          "https://dummyjson.com/auth/refresh",
          { refreshToken }
        );
        setTokens(data.accessToken, data.refreshToken);
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        clearTokens();
        window.location.href = "/login";
      }
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

export default api;
