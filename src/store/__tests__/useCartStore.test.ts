import { renderHook, act } from "@testing-library/react";
import { useCartStore } from "../useCartStore";
import { useAuthStore } from "../useAuthStore";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
  success: jest.fn(),
}));
jest.mock("../useAuthStore");
jest.mock("../../lib/authGuard", () => ({
  requireAuth: jest.fn(() => true),
}));

const mockToast = toast as jest.Mocked<typeof toast>;

describe("useCartStore", () => {
  beforeEach(() => {
    // Reset store state
    useCartStore.getState().reset();
    jest.clearAllMocks();

    // Mock auth store
    useAuthStore.getState = jest.fn().mockReturnValue({
      user: { id: 1, email: "test@example.com" },
      accessToken: "valid-token",
      refreshToken: "refresh-token",
      setUser: jest.fn(),
      setTokens: jest.fn(),
      clearTokens: jest.fn(),
      isAuthenticated: jest.fn(() => true),
      reset: jest.fn(),
    });
  });

  describe("Adding items to cart", () => {
    /**
     * BDD Scenario: Adding items to cart
     *   Given I am a logged-in user
     *   When I add a product to my cart
     *   Then the product should be added with quantity 1
     *   And the cart should show the updated total
     *
     * BDD Scenario: Adding existing item to cart
     *   Given I have a product in my cart
     *   When I add the same product again
     *   Then the quantity should increase by 1
     *   And the stock should be validated
     *
     * BDD Scenario: Stock validation
     *   Given I try to add more items than available stock
     *   When I attempt to add to cart
     *   Then I should see an error message
     *   And the item should not be added
     */
    it("should add a new item to cart with quantity 1", () => {
      // Given: a new product and empty cart
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 5,
      };

      // When: adding the product to cart
      act(() => {
        result.current.addItem(product);
      });

      // Then: it should be added with quantity 1
      expect(result.current.getItemQuantity(1)).toBe(1);
    });

    it("should increase quantity when adding existing item", () => {
      // Given: a product already in cart
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 5,
      };

      // When: adding the same product again
      // Add item first time
      act(() => {
        result.current.addItem(product);
      });

      // Add same item again
      act(() => {
        result.current.addItem(product);
      });

      // Then: quantity should increase by 1
      expect(result.current.getItemQuantity(1)).toBe(2);
    });

    it("should not add item if out of stock", () => {
      // Given: a product with no stock
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 0,
      };

      // When: trying to add out of stock item
      act(() => {
        result.current.addItem(product);
      });

      // Then: it should not be added and show error
      expect(result.current.getItemQuantity(1)).toBe(0);
      expect(mockToast.error).toHaveBeenCalledWith("This item is out of stock");
    });

    it("should not add item if quantity exceeds stock", () => {
      // Given: a product with limited stock
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 2,
      };

      // When: trying to exceed stock limit
      // Add item to reach stock limit
      act(() => {
        result.current.addItem(product);
      });
      act(() => {
        result.current.addItem(product);
      });

      // Try to add one more
      act(() => {
        result.current.addItem(product);
      });

      // Then: it should not exceed stock and show error
      expect(result.current.getItemQuantity(1)).toBe(2);
      expect(mockToast.error).toHaveBeenCalledWith(
        "Only 2 items available in stock"
      );
    });
  });

  describe("Removing items from cart", () => {
    /**
     * BDD Scenario: Removing items from cart
     *   Given I have items in my cart
     *   When I remove an item
     *   Then the item should be removed from cart
     *   And the cart total should be updated
     */
    it("should remove item from cart", () => {
      // Given: an item in the cart
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 5,
      };

      // Add item first
      act(() => {
        result.current.addItem(product);
      });

      expect(result.current.getItemQuantity(1)).toBe(1);

      // When: removing the item
      act(() => {
        result.current.removeItem(1);
      });

      // Then: it should be removed and show success message
      expect(result.current.getItemQuantity(1)).toBe(0);
      expect(mockToast.success).toHaveBeenCalledWith("Item removed from cart");
    });
  });

  describe("Updating item quantity", () => {
    /**
     * BDD Scenario: Updating item quantity
     *   Given I have an item in my cart
     *   When I change the quantity
     *   Then the quantity should be updated
     *   And stock limits should be enforced
     */
    it("should update item quantity", () => {
      // Given: an item in the cart
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 5,
      };

      // Add item first
      act(() => {
        result.current.addItem(product);
      });

      // When: updating the quantity
      act(() => {
        result.current.updateQuantity(1, 3);
      });

      // Then: quantity should be updated
      expect(result.current.getItemQuantity(1)).toBe(3);
    });

    it("should remove item when quantity is set to 0", () => {
      // Given: an item in the cart
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 5,
      };

      // Add item first
      act(() => {
        result.current.addItem(product);
      });

      // When: setting quantity to 0
      act(() => {
        result.current.updateQuantity(1, 0);
      });

      // Then: item should be removed and show success message
      expect(result.current.getItemQuantity(1)).toBe(0);
      expect(mockToast.success).toHaveBeenCalledWith("Item removed from cart");
    });

    it("should not update quantity if it exceeds stock", () => {
      // Given: an item in cart with limited stock
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 2,
      };

      // Add item first
      act(() => {
        result.current.addItem(product);
      });

      // When: trying to set quantity higher than stock
      act(() => {
        result.current.updateQuantity(1, 5);
      });

      // Then: quantity should not be updated and show error
      expect(result.current.getItemQuantity(1)).toBe(1);
      expect(mockToast.error).toHaveBeenCalledWith(
        "Only 2 items available in stock"
      );
    });

    it("should not allow negative quantities", () => {
      // Given: an item in the cart
      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 5,
      };

      // Add item first
      act(() => {
        result.current.addItem(product);
      });

      // When: trying to set negative quantity
      act(() => {
        result.current.updateQuantity(1, -1);
      });

      // Then: quantity should not be updated and show error
      expect(result.current.getItemQuantity(1)).toBe(1);
      expect(mockToast.error).toHaveBeenCalledWith(
        "Quantity cannot be negative"
      );
    });
  });

  describe("Clearing cart", () => {
    /**
     * BDD Scenario: Clearing cart
     *   Given I have items in my cart
     *   When I clear the cart
     *   Then all items should be removed
     *   And the cart should be empty
     */
    it("should clear all items from cart", () => {
      // Given: multiple items in the cart
      const { result } = renderHook(() => useCartStore());

      const products = [
        {
          id: 1,
          title: "Product 1",
          price: 10.99,
          thumbnail: "test1.jpg",
          stock: 5,
        },
        {
          id: 2,
          title: "Product 2",
          price: 15.99,
          thumbnail: "test2.jpg",
          stock: 3,
        },
      ];

      // Add multiple items
      act(() => {
        products.forEach((product) => result.current.addItem(product));
      });

      expect(result.current.getItemQuantity(1)).toBe(1);
      expect(result.current.getItemQuantity(2)).toBe(1);

      // When: clearing the cart
      act(() => {
        result.current.clearCart();
      });

      // Then: all items should be removed and show success message
      expect(result.current.getItemQuantity(1)).toBe(0);
      expect(result.current.getItemQuantity(2)).toBe(0);
      expect(mockToast.success).toHaveBeenCalledWith("Cart cleared");
    });
  });

  describe("Authentication requirements", () => {
    /**
     * BDD Scenario: Authentication requirements
     *   Given I am not logged in
     *   When I try to add items to cart
     *   Then the action should be prevented
     *   And I should be prompted to log in
     */
    it("should not add item if user is not authenticated", () => {
      // Given: user is not authenticated
      useAuthStore.getState = jest.fn().mockReturnValue({
        user: null,
        accessToken: null,
        refreshToken: null,
        setUser: jest.fn(),
        setTokens: jest.fn(),
        clearTokens: jest.fn(),
        isAuthenticated: jest.fn(() => false),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useCartStore());

      const product = {
        id: 1,
        title: "Test Product",
        price: 10.99,
        thumbnail: "test.jpg",
        stock: 5,
      };

      // When: trying to add item to cart
      act(() => {
        result.current.addItem(product);
      });

      // Then: item should not be added and show error
      expect(result.current.getItemQuantity(1)).toBe(0);
      expect(mockToast.error).toHaveBeenCalledWith(
        "Please log in to add items to cart"
      );
    });
  });
});
