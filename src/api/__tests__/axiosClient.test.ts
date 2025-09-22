/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiHandler } from "../axiosClient";

describe("API Handler Functions", () => {
  describe("handleError", () => {
    /**
     * BDD Scenario: Error Handling
     *   Given an API request fails
     *   When the error occurs
     *   Then the system should handle different error types appropriately
     *   And return meaningful error messages
     *   And preserve error status codes
     */
    it("should handle axios response errors with status codes", () => {
      // Given: an axios error with response
      const axiosError = new Error("Request failed");
      (axiosError as any).response = {
        status: 401,
        data: { message: "Unauthorized" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "login");

      // Then: it should return appropriate error message
      expect(result.message).toBe(
        "You are not authorized. Please log in again."
      );
      expect(result.status).toBe(401);
    });

    it("should handle 400 Bad Request error", () => {
      // Given: a 400 error
      const axiosError = new Error("Bad request");
      (axiosError as any).response = {
        status: 400,
        data: { message: "Invalid request" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "login");

      // Then: it should return appropriate message
      expect(result.message).toBe("Invalid request: login");
      expect(result.status).toBe(400);
    });

    it("should handle 403 Forbidden error", () => {
      // Given: a 403 error
      const axiosError = new Error("Forbidden");
      (axiosError as any).response = {
        status: 403,
        data: { message: "Forbidden" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "access resource");

      // Then: it should return appropriate message
      expect(result.message).toBe(
        "You don't have permission to perform this action."
      );
      expect(result.status).toBe(403);
    });

    it("should handle 404 Not Found error", () => {
      // Given: a 404 error
      const axiosError = new Error("Not found");
      (axiosError as any).response = {
        status: 404,
        data: { message: "Not found" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "fetch data");

      // Then: it should return appropriate message
      expect(result.message).toBe("The requested resource was not found.");
      expect(result.status).toBe(404);
    });

    it("should handle 409 Conflict error", () => {
      // Given: a 409 error
      const axiosError = new Error("Conflict");
      (axiosError as any).response = {
        status: 409,
        data: { message: "Conflict" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "create resource");

      // Then: it should return appropriate message
      expect(result.message).toBe(
        "Conflict: The operation could not be completed."
      );
      expect(result.status).toBe(409);
    });

    it("should handle 429 Too Many Requests error", () => {
      // Given: a 429 error
      const axiosError = new Error("Rate limited");
      (axiosError as any).response = {
        status: 429,
        data: { message: "Rate limited" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "make request");

      // Then: it should return appropriate message
      expect(result.message).toBe("Too many requests. Please try again later.");
      expect(result.status).toBe(429);
    });

    it("should handle 500 Internal Server Error", () => {
      // Given: a 500 error
      const axiosError = new Error("Internal error");
      (axiosError as any).response = {
        status: 500,
        data: { message: "Internal error" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "process data");

      // Then: it should return appropriate message
      expect(result.message).toBe("Server error. Please try again later.");
      expect(result.status).toBe(500);
    });

    it("should handle 503 Service Unavailable error", () => {
      // Given: a 503 error
      const axiosError = new Error("Service down");
      (axiosError as any).response = {
        status: 503,
        data: { message: "Service down" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "connect to service");

      // Then: it should return appropriate message
      expect(result.message).toBe(
        "Service unavailable. Please try again later."
      );
      expect(result.status).toBe(503);
    });

    it("should handle unknown status codes", () => {
      // Given: an unknown status code
      const axiosError = new Error("I'm a teapot");
      (axiosError as any).response = {
        status: 418,
        data: { message: "I'm a teapot" },
      };

      // When: handling the error
      const result = ApiHandler.handleError(axiosError, "make coffee");

      // Then: it should return the custom message
      expect(result.message).toBe("I'm a teapot");
      expect(result.status).toBe(418);
    });

    it("should handle network errors", () => {
      // Given: a network error
      const networkError = new Error("Network Error");
      (networkError as any).request = {};

      // When: handling the error
      const result = ApiHandler.handleError(networkError, "fetch data");

      // Then: it should return network error message
      expect(result.message).toBe(
        "Network error. Please check your connection and try again."
      );
      expect(result.code).toBe("NETWORK_ERROR");
    });

    it("should handle generic errors", () => {
      // Given: a generic error
      const genericError = new Error("Something went wrong");

      // When: handling the error
      const result = ApiHandler.handleError(genericError, "perform action");

      // Then: it should return the error message
      expect(result.message).toBe("Something went wrong");
    });

    it("should handle string errors", () => {
      // Given: a string error
      const stringError = "Custom error message";

      // When: handling the error
      const result = ApiHandler.handleError(stringError, "perform action");

      // Then: it should return the string
      expect(result.message).toBe("Custom error message");
    });

    it("should handle unknown error types", () => {
      // Given: an unknown error type
      const unknownError = { someProperty: "value" };

      // When: handling the error
      const result = ApiHandler.handleError(unknownError, "perform action");

      // Then: it should return default message
      expect(result.message).toBe("Failed to perform action");
    });
  });
});
