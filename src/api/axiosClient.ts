/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosResponse } from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { authApi } from "../service/auth.api";
import toast from "react-hot-toast";

// Whitelist of endpoints that don't require authentication
const AUTH_WHITELIST = ["/auth/login"];

const isWhitelistedEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_WHITELIST.some((endpoint) => url.includes(endpoint));
};

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
export class ApiHandler {
  static handleError(error: unknown, operation: string): ApiError {
    let errorMessage = `Failed to ${operation}`;
    let status: number | undefined;
    let code: string | undefined;

    if (error instanceof Error) {
      // Handle Axios errors
      if ("response" in error && error.response) {
        const response = error.response as {
          status: number;
          data?: { message?: string };
        };
        status = response.status;

        switch (status) {
          case 400:
            errorMessage = `Invalid request: ${operation}`;
            break;
          case 401:
            errorMessage = "You are not authorized. Please log in again.";
            break;
          case 403:
            errorMessage = "You don't have permission to perform this action.";
            break;
          case 404:
            errorMessage = "The requested resource was not found.";
            break;
          case 409:
            errorMessage = "Conflict: The operation could not be completed.";
            break;
          case 429:
            errorMessage = "Too many requests. Please try again later.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          case 503:
            errorMessage = "Service unavailable. Please try again later.";
            break;
          default:
            errorMessage =
              response.data?.message || `Error ${status}: ${operation}`;
        }
      } else if ("request" in error && error.request) {
        // Network error
        errorMessage =
          "Network error. Please check your connection and try again.";
        code = "NETWORK_ERROR";
      } else {
        // Other errors
        errorMessage = error.message || errorMessage;
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return { message: errorMessage, status, code };
  }

  static showError(error: unknown, operation: string): ApiError {
    const apiError = this.handleError(error, operation);
    toast.error(apiError.message);
    return apiError;
  }

  static showSuccess(message: string): void {
    toast.success(message);
  }

  static showLoading(message: string): string {
    return toast.loading(message);
  }

  static dismissToast(toastId: string): void {
    toast.dismiss(toastId);
  }
}

// Retry utility function
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying, with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

const axiosInstance = axios.create({ baseURL: "https://dummyjson.com" });

axiosInstance.interceptors.request.use(async (config) => {
  if (isWhitelistedEndpoint(config.url)) return config;

  const { accessToken, refreshToken, isAuthenticated, setTokens, clearTokens } =
    useAuthStore.getState();

  if (!accessToken) {
    clearTokens();
    window.location.href = "/login";
    return config;
  }

  if (!isAuthenticated() && refreshToken) {
    try {
      const { data } = await authApi.refresh(refreshToken);
      setTokens(data.accessToken, data.refreshToken);
      if (config.headers)
        config.headers.Authorization = `Bearer ${data.accessToken}`;
    } catch {
      clearTokens();
      window.location.href = "/login";
    }
  } else if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { clearTokens } = useAuthStore.getState();
      clearTokens();
      window.location.href = "/login";
    }
    // Show toast automatically for all errors
    ApiHandler.showError(error, "API request");
    return Promise.reject(error);
  }
);

// Wrap axios methods to auto-handle errors and return data
const api = new Proxy(axiosInstance, {
  get(target, prop: string) {
    if (typeof target[prop as keyof typeof target] !== "function") {
      return target[prop as keyof typeof target];
    }

    return async (...args: any[]) => {
      // --- FAKE ERROR for testing ---
      // if (args[0] === "/test-error") {
      //   const fakeError = {
      //     response: {
      //       status: 401,
      //       data: { message: "Fake unauthorized error" },
      //     },
      //   };
      //   ApiHandler.showError(fakeError, `${prop.toUpperCase()}`);
      //   throw fakeError;
      // }

      // --- normal axios request ---
      try {
        const res: AxiosResponse = await (
          target[prop as keyof typeof target] as any
        )(...args);
        return res;
      } catch (error) {
        ApiHandler.showError(error, `${prop.toUpperCase()}`);
        throw error;
      }
    };
  },
});

export default api;
