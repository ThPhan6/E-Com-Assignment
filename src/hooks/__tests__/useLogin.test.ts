import { renderHook, act } from "@testing-library/react";
import { useLogin } from "../useLogin";
import { useAuthStore } from "../../store/useAuthStore";
import { ApiHandler } from "../../api/axiosClient";

// Mock dependencies
jest.mock("../../store/useAuthStore");
jest.mock("../../api/axiosClient");
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockApiHandler = ApiHandler as jest.Mocked<typeof ApiHandler>;

describe("useLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuthStore return value
    mockUseAuthStore.mockReturnValue({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn(),
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  describe("handleLogin", () => {
    it("should call store login method with credentials", async () => {
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      mockUseAuthStore.mockReturnValue({
        login: mockLogin,
        logout: jest.fn(),
        isAuthenticated: jest.fn(),
        user: null,
        accessToken: null,
        refreshToken: null,
      });

      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ username: "test", password: "password" });
      });

      expect(mockLogin).toHaveBeenCalledWith({
        username: "test",
        password: "password",
      });
    });

    it("should throw error when login fails", async () => {
      const mockLogin = jest.fn().mockRejectedValue(new Error("Login failed"));
      mockUseAuthStore.mockReturnValue({
        login: mockLogin,
        logout: jest.fn(),
        isAuthenticated: jest.fn(),
        user: null,
        accessToken: null,
        refreshToken: null,
      });

      const { result } = renderHook(() => useLogin());

      await expect(
        act(async () => {
          await result.current.login({
            username: "test",
            password: "password",
          });
        })
      ).rejects.toThrow("Login failed");
    });
  });

  describe("handleLogout", () => {
    it("should call store logout and navigate to login", () => {
      const mockLogout = jest.fn();
      mockUseAuthStore.mockReturnValue({
        login: jest.fn(),
        logout: mockLogout,
        isAuthenticated: jest.fn(),
        user: null,
        accessToken: null,
        refreshToken: null,
      });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockApiHandler.showSuccess).toHaveBeenCalledWith(
        "Logged out successfully"
      );
    });
  });

  describe("checkAuthStatus", () => {
    it("should return authentication status from store", () => {
      const mockIsAuthenticated = jest.fn().mockReturnValue(true);
      mockUseAuthStore.mockReturnValue({
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: mockIsAuthenticated,
        user: null,
        accessToken: null,
        refreshToken: null,
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.isAuthenticated()).toBe(true);
      expect(mockIsAuthenticated).toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should return user from store", () => {
      const mockUser = { id: 1, username: "test" } as any;
      mockUseAuthStore.mockReturnValue({
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: jest.fn(),
        user: mockUser,
        accessToken: null,
        refreshToken: null,
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe("getTokens", () => {
    it("should return tokens from store", () => {
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      mockUseAuthStore.mockReturnValue({
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: jest.fn(),
        user: null,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.tokens).toEqual(mockTokens);
    });
  });
});
