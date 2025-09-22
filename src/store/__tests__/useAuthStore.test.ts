import { useAuthStore } from "../useAuthStore";
import { isTokenValid } from "../../lib/tokenHelper";

// Mock the tokenHelper
jest.mock("../../lib/tokenHelper", () => ({
  isTokenValid: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Auth Store Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.getState().reset();
  });

  describe("setUser", () => {
    /**
     * BDD Scenario: User Management
     *   Given a user object
     *   When the system needs to store user information
     *   Then it should save the user data in the store
     *   And allow updating existing user information
     */
    it("should set user in store", () => {
      // Given: a user object
      const user = {
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

      // When: setting the user
      useAuthStore.getState().setUser(user);

      // Then: the user should be stored
      expect(useAuthStore.getState().user).toEqual(user);
    });

    it("should update existing user when setting new user", () => {
      // Given: an existing user in store
      const existingUser = {
        id: 1,
        username: "olduser",
        email: "old@example.com",
        firstName: "Old",
        lastName: "User",
        image: "https://example.com/old.jpg",
        age: 30,
        gender: "female",
        phone: "0987654321",
        password: "oldpass",
        birthDate: "1990-01-01",
      };
      useAuthStore.getState().setUser(existingUser);

      const newUser = {
        id: 2,
        username: "newuser",
        email: "new@example.com",
        firstName: "New",
        lastName: "User",
        image: "https://example.com/new.jpg",
        age: 25,
        gender: "male",
        phone: "1234567890",
        password: "newpass",
        birthDate: "1999-01-01",
      };

      // When: setting a new user
      useAuthStore.getState().setUser(newUser);

      // Then: the user should be updated
      expect(useAuthStore.getState().user).toEqual(newUser);
    });
  });

  describe("setTokens", () => {
    /**
     * BDD Scenario: Token Management
     *   Given access and refresh tokens
     *   When the system needs to store authentication tokens
     *   Then it should save tokens in both store and localStorage
     *   And allow updating existing tokens
     */
    it("should set tokens in store and localStorage", () => {
      // Given: access and refresh tokens
      const accessToken = "access-token-123";
      const refreshToken = "refresh-token-456";

      // When: setting tokens
      useAuthStore.getState().setTokens(accessToken, refreshToken);

      // Then: tokens should be stored in store and localStorage
      expect(useAuthStore.getState().accessToken).toBe(accessToken);
      expect(useAuthStore.getState().refreshToken).toBe(refreshToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "accessToken",
        accessToken
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        refreshToken
      );
    });

    it("should update existing tokens when setting new tokens", () => {
      // Given: existing tokens in store
      useAuthStore.getState().setTokens("old-access", "old-refresh");

      const newAccessToken = "new-access-token";
      const newRefreshToken = "new-refresh-token";

      // When: setting new tokens
      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

      // Then: tokens should be updated
      expect(useAuthStore.getState().accessToken).toBe(newAccessToken);
      expect(useAuthStore.getState().refreshToken).toBe(newRefreshToken);
    });
  });

  describe("clearTokens", () => {
    /**
     * BDD Scenario: Token Cleanup
     *   Given stored authentication tokens
     *   When the user logs out or tokens expire
     *   Then the system should remove tokens from both store and localStorage
     *   And handle cleanup when no tokens exist
     */
    it("should clear tokens from store and localStorage", () => {
      // Given: tokens in store
      useAuthStore.getState().setTokens("access-token", "refresh-token");

      // When: clearing tokens
      useAuthStore.getState().clearTokens();

      // Then: tokens should be cleared from store and localStorage
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().refreshToken).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("accessToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refreshToken");
    });

    it("should handle clearing tokens when no tokens exist", () => {
      // Given: no tokens in store
      // When: clearing tokens
      useAuthStore.getState().clearTokens();

      // Then: should not throw error and tokens should be null
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().refreshToken).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    /**
     * BDD Scenario: Authentication Status Check
     *   Given a stored authentication token
     *   When the system needs to check authentication status
     *   Then it should validate the token
     *   And return true for valid tokens
     *   And return false for invalid or missing tokens
     */
    it("should return true when token is valid", () => {
      // Given: a valid token in localStorage
      (isTokenValid as jest.Mock).mockReturnValue(true);
      mockLocalStorage.getItem.mockReturnValue("valid-token");

      // When: checking authentication status
      const result = useAuthStore.getState().isAuthenticated();

      // Then: it should return true
      expect(result).toBe(true);
      expect(isTokenValid).toHaveBeenCalledWith("valid-token");
    });

    it("should return false when token is invalid", () => {
      // Given: an invalid token in localStorage
      (isTokenValid as jest.Mock).mockReturnValue(false);
      mockLocalStorage.getItem.mockReturnValue("invalid-token");

      // When: checking authentication status
      const result = useAuthStore.getState().isAuthenticated();

      // Then: it should return false
      expect(result).toBe(false);
      expect(isTokenValid).toHaveBeenCalledWith("invalid-token");
    });

    it("should return false when no token exists", () => {
      // Given: no token in localStorage
      (isTokenValid as jest.Mock).mockReturnValue(false);
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: checking authentication status
      const result = useAuthStore.getState().isAuthenticated();

      // Then: it should return false
      expect(result).toBe(false);
      expect(isTokenValid).toHaveBeenCalledWith(null);
    });
  });

  describe("reset", () => {
    /**
     * BDD Scenario: Store Reset
     *   Given a store with user and token data
     *   When the system needs to reset the store
     *   Then it should clear all stored data
     *   And return to initial state
     *   And handle reset when store is already empty
     */
    it("should reset all state to initial values", () => {
      // Given: store with user and tokens
      const user = {
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
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setTokens("access", "refresh");

      // When: resetting the store
      useAuthStore.getState().reset();

      // Then: all state should be reset
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().refreshToken).toBeNull();
    });

    it("should handle reset when store is already empty", () => {
      // Given: empty store
      // When: resetting the store
      useAuthStore.getState().reset();

      // Then: should not throw error and state should remain null
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().refreshToken).toBeNull();
    });
  });
});
