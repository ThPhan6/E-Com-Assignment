import toast from "react-hot-toast";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiErrorHandler {
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
