import type { AxiosResponse } from "axios";

declare global {
  // Generic axios response type
  type ApiResponse<T> = Promise<AxiosResponse<T>>;

  // Optionally: API error response
  interface ApiErrorResponse {
    message?: string;
    status: number;
    code: string;
  }
}

export {};
