import { renderHook, act } from "@testing-library/react";
import { useAuthStore } from "../useAuthStore";
import { authApi } from "../../service/auth.api";
import { isTokenValid } from "../../lib/tokenHelper";

// Mock dependencies
jest.mock("../../service/auth.api");
jest.mock("../../lib/tokenHelper");
jest.mock("zustand/middleware", () => ({
  persist: (fn: any) => fn,
}));

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockIsTokenValid = isTokenValid as jest.MockedFunction<
  typeof isTokenValid
>;

describe("useAuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  describe("Initial State", () => {
    it("should have initial state with null values", () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return false when no access token", () => {
      mockIsTokenValid.mockReturnValue(false);
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isAuthenticated()).toBe(false);
    });

    it("should return true when valid access token", () => {
      mockIsTokenValid.mockReturnValue(true);
      useAuthStore.setState({ accessToken: "valid-token" });

      const { result } = renderHook(() => useAuthStore());
      expect(result.current.isAuthenticated()).toBe(true);
    });
  });

  describe("setTokens", () => {
    it("should set access and refresh tokens", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTokens("access-token", "refresh-token");
      });

      expect(result.current.accessToken).toBe("access-token");
      expect(result.current.refreshToken).toBe("refresh-token");
    });
  });

  describe("clearTokens", () => {
    it("should clear all authentication data", () => {
      const { result } = renderHook(() => useAuthStore());

      // Set some initial state
      act(() => {
        result.current.setTokens("access-token", "refresh-token");
        result.current.setUser({ id: 1, username: "test" } as any);
      });

      act(() => {
        result.current.clearTokens();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe("setUser", () => {
    it("should set user data", () => {
      const { result } = renderHook(() => useAuthStore());
      const user = {
        id: 1,
        username: "test",
        email: "test@example.com",
      } as any;

      act(() => {
        result.current.setUser(user);
      });

      expect(result.current.user).toEqual(user);
    });
  });

  describe("login", () => {
    it("should login successfully and fetch user data", async () => {
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };
      const mockUser = { id: 1, username: "test" } as any;

      mockAuthApi.login.mockResolvedValue({ data: mockTokens } as any);
      mockAuthApi.me.mockResolvedValue({ data: mockUser } as any);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({ username: "test", password: "password" });
      });

      expect(mockAuthApi.login).toHaveBeenCalledWith({
        username: "test",
        password: "password",
      });
      expect(mockAuthApi.me).toHaveBeenCalled();
      expect(result.current.accessToken).toBe("access-token");
      expect(result.current.refreshToken).toBe("refresh-token");
      expect(result.current.user).toEqual(mockUser);
    });

    it("should clear tokens on login failure", async () => {
      mockAuthApi.login.mockRejectedValue(new Error("Login failed"));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login({
            username: "test",
            password: "password",
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe("logout", () => {
    it("should clear all authentication data", () => {
      const { result } = renderHook(() => useAuthStore());

      // Set some initial state
      act(() => {
        result.current.setTokens("access-token", "refresh-token");
        result.current.setUser({ id: 1, username: "test" } as any);
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe("refreshAccessToken", () => {
    it("should refresh token successfully", async () => {
      const mockTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      mockIsTokenValid.mockReturnValue(true);
      mockAuthApi.refresh.mockResolvedValue({ data: mockTokens } as any);

      const { result } = renderHook(() => useAuthStore());

      // Set initial refresh token
      act(() => {
        result.current.setTokens("old-access-token", "refresh-token");
      });

      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshAccessToken();
      });

      expect(refreshResult!).toBe(true);
      expect(result.current.accessToken).toBe("new-access-token");
      expect(result.current.refreshToken).toBe("new-refresh-token");
    });

    it("should return false and clear tokens when refresh fails", async () => {
      mockIsTokenValid.mockReturnValue(true);
      mockAuthApi.refresh.mockRejectedValue(new Error("Refresh failed"));

      const { result } = renderHook(() => useAuthStore());

      // Set initial refresh token
      act(() => {
        result.current.setTokens("old-access-token", "refresh-token");
      });

      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshAccessToken();
      });

      expect(refreshResult!).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
    });

    it("should return false when refresh token is invalid", async () => {
      mockIsTokenValid.mockReturnValue(false);

      const { result } = renderHook(() => useAuthStore());

      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshAccessToken();
      });

      expect(refreshResult!).toBe(false);
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch and set user data", async () => {
      const mockUser = { id: 1, username: "test" } as any;
      mockAuthApi.me.mockResolvedValue({ data: mockUser } as any);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(mockAuthApi.me).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
    });

    it("should clear tokens when getCurrentUser fails", async () => {
      mockAuthApi.me.mockRejectedValue(new Error("Failed to get user"));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.getCurrentUser();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });
});
