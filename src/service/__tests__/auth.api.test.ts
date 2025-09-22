import { authApi } from "../auth.api";
import axiosClient from "../../api/axiosClient";
import { showLoading, hideLoading } from "../../store/useLoadingStore";

// Mock dependencies
jest.mock("../../api/axiosClient");
jest.mock("../../store/useLoadingStore");

const mockAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;
const mockShowLoading = showLoading as jest.MockedFunction<typeof showLoading>;
const mockHideLoading = hideLoading as jest.MockedFunction<typeof hideLoading>;

describe("Auth API Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    /**
     * BDD Scenario: User Login
     *   Given a user has valid credentials
     *   When they attempt to log in
     *   Then the system should authenticate the user
     *   And return access and refresh tokens
     *   And handle authentication errors appropriately
     */
    it("should call login endpoint with correct data", async () => {
      // Given: login credentials
      const loginData = {
        username: "testuser",
        password: "testpass",
        expiresInMins: 60,
      };
      const mockResponse = {
        status: 200,
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      };
      mockAxiosClient.post.mockResolvedValue(mockResponse);

      // When: calling login API
      const result = await authApi.login(loginData);

      // Then: it should call the correct endpoint with correct data
      expect(mockAxiosClient.post).toHaveBeenCalledWith(
        "/auth/login",
        loginData
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle successful login response", async () => {
      // Given: successful login response
      const mockResponse = {
        status: 200,
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      };
      mockAxiosClient.post.mockResolvedValue(mockResponse);

      // When: calling login API
      const result = await authApi.login({
        username: "testuser",
        password: "testpass",
      });

      // Then: it should return the response data
      expect(result.status).toBe(200);
      expect(result.data).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
    });

    it("should handle failed login response", async () => {
      // Given: failed login response
      const mockResponse = {
        status: 401,
        data: null,
      };
      mockAxiosClient.post.mockResolvedValue(mockResponse);

      // When: calling login API
      const result = await authApi.login({
        username: "testuser",
        password: "wrongpass",
      });

      // Then: it should return the error response
      expect(result.status).toBe(401);
      expect(result.data).toBeNull();
    });

    it("should handle network errors", async () => {
      // Given: network error
      const networkError = new Error("Network Error");
      mockAxiosClient.post.mockRejectedValue(networkError);

      // When: calling login API
      // Then: it should throw the error
      await expect(
        authApi.login({
          username: "testuser",
          password: "testpass",
        })
      ).rejects.toThrow("Network Error");
    });

    it("should use provided expiresInMins when not specified", async () => {
      // Given: login data without expiresInMins
      const loginData = {
        username: "testuser",
        password: "testpass",
      };
      const mockResponse = {
        status: 200,
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      };
      mockAxiosClient.post.mockResolvedValue(mockResponse);

      // When: calling login API
      await authApi.login(loginData);

      // Then: it should use the data as provided (no default expiresInMins)
      expect(mockAxiosClient.post).toHaveBeenCalledWith("/auth/login", {
        username: "testuser",
        password: "testpass",
      });
    });
  });

  describe("me", () => {
    /**
     * BDD Scenario: Get User Profile
     *   Given a user is authenticated
     *   When they request their profile information
     *   Then the system should return their user data
     *   And show loading indicators
     *   And handle profile retrieval errors
     */
    it("should call me endpoint and show/hide loading", async () => {
      // Given: user data response
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        image: "https://example.com/image.jpg",
        age: 25,
        gender: "male",
        phone: "1234567890",
        password: "password",
        birthDate: "1999-01-01",
      };
      const mockResponse = {
        status: 200,
        data: mockUser,
      };
      mockAxiosClient.get.mockResolvedValue(mockResponse);

      // When: calling me API
      const result = await authApi.me();

      // Then: it should show loading, call endpoint, hide loading, and return data
      expect(mockShowLoading).toHaveBeenCalled();
      expect(mockAxiosClient.get).toHaveBeenCalledWith("/auth/me");
      expect(mockHideLoading).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle me endpoint errors", async () => {
      // Given: API error
      const error = new Error("Unauthorized");
      mockAxiosClient.get.mockRejectedValue(error);

      // When: calling me API
      // Then: it should throw the error and show loading (but not hide loading due to no try-catch)
      await expect(authApi.me()).rejects.toThrow("Unauthorized");
      expect(mockShowLoading).toHaveBeenCalled();
      expect(mockHideLoading).not.toHaveBeenCalled();
    });

    it("should handle me endpoint with no data", async () => {
      // Given: response with no data
      const mockResponse = {
        status: 200,
        data: null,
      };
      mockAxiosClient.get.mockResolvedValue(mockResponse);

      // When: calling me API
      const result = await authApi.me();

      // Then: it should return the response
      expect(result).toEqual(mockResponse);
    });
  });

  describe("refresh", () => {
    /**
     * BDD Scenario: Token Refresh
     *   Given a user has a valid refresh token
     *   When their access token expires
     *   Then the system should refresh the access token
     *   And return new tokens
     *   And handle refresh token errors
     */
    it("should call refresh endpoint with refresh token", async () => {
      // Given: refresh token and response
      const refreshToken = "old-refresh-token";
      const mockResponse = {
        status: 200,
        data: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      };
      mockAxiosClient.post.mockResolvedValue(mockResponse);

      // When: calling refresh API
      const result = await authApi.refresh(refreshToken);

      // Then: it should call the correct endpoint with correct data
      expect(mockAxiosClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken,
        expiresInMins: 24,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should use custom expiresInMins when provided", async () => {
      // Given: refresh token with custom expires
      const refreshToken = "old-refresh-token";
      const customExpires = 60;
      const mockResponse = {
        status: 200,
        data: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      };
      mockAxiosClient.post.mockResolvedValue(mockResponse);

      // When: calling refresh API with custom expires
      const result = await authApi.refresh(refreshToken, customExpires);

      // Then: it should use the custom expiresInMins
      expect(mockAxiosClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken,
        expiresInMins: customExpires,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle refresh token errors", async () => {
      // Given: refresh token error
      const error = new Error("Invalid refresh token");
      mockAxiosClient.post.mockRejectedValue(error);

      // When: calling refresh API
      // Then: it should throw the error
      await expect(authApi.refresh("invalid-token")).rejects.toThrow(
        "Invalid refresh token"
      );
    });

    it("should handle refresh with empty token", async () => {
      // Given: empty refresh token
      const mockResponse = {
        status: 400,
        data: { message: "Invalid token" },
      };
      mockAxiosClient.post.mockResolvedValue(mockResponse);

      // When: calling refresh API with empty token
      const result = await authApi.refresh("");

      // Then: it should call the endpoint and return the error response
      expect(mockAxiosClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken: "",
        expiresInMins: 24,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
