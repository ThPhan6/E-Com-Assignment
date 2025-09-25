import { authApi } from "../auth.api";
import axiosClient from "../../api/axiosClient";

// Mock axios client
jest.mock("../../api/axiosClient");
jest.mock("../../store/useLoadingStore", () => ({
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
}));

const mockAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;

describe("authApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should call login endpoint with credentials", async () => {
      const credentials = {
        username: "test",
        password: "password",
        expiresInMins: 30,
      };

      const mockResponse = {
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      };

      mockAxiosClient.post.mockResolvedValue(mockResponse);

      const result = await authApi.login(credentials);

      expect(mockAxiosClient.post).toHaveBeenCalledWith(
        "/auth/login",
        credentials
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle login errors", async () => {
      const credentials = {
        username: "test",
        password: "password",
      };

      const error = new Error("Login failed");
      mockAxiosClient.post.mockRejectedValue(error);

      await expect(authApi.login(credentials)).rejects.toThrow("Login failed");
    });
  });

  describe("me", () => {
    it("should call me endpoint and return user data", async () => {
      const mockUser = {
        id: 1,
        username: "test",
        email: "test@example.com",
      };

      const mockResponse = {
        data: mockUser,
      };

      mockAxiosClient.get.mockResolvedValue(mockResponse);

      const result = await authApi.me();

      expect(mockAxiosClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockResponse);
    });

    it("should handle me endpoint errors", async () => {
      const error = new Error("Failed to get user");
      mockAxiosClient.get.mockRejectedValue(error);

      await expect(authApi.me()).rejects.toThrow("Failed to get user");
    });
  });

  describe("refresh", () => {
    it("should call refresh endpoint with refresh token", async () => {
      const refreshToken = "refresh-token";
      const expiresInMins = 24;

      const mockResponse = {
        data: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      };

      mockAxiosClient.post.mockResolvedValue(mockResponse);

      const result = await authApi.refresh(refreshToken, expiresInMins);

      expect(mockAxiosClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken,
        expiresInMins,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should use default expiresInMins when not provided", async () => {
      const refreshToken = "refresh-token";

      const mockResponse = {
        data: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      };

      mockAxiosClient.post.mockResolvedValue(mockResponse);

      await authApi.refresh(refreshToken);

      expect(mockAxiosClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken,
        expiresInMins: 24,
      });
    });

    it("should handle refresh errors", async () => {
      const refreshToken = "refresh-token";
      const error = new Error("Refresh failed");
      mockAxiosClient.post.mockRejectedValue(error);

      await expect(authApi.refresh(refreshToken)).rejects.toThrow(
        "Refresh failed"
      );
    });
  });
});
