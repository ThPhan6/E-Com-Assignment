import { renderHook, act } from "@testing-library/react";
import { useCartPopup } from "../useCartPopup";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

// Mock dependencies
jest.mock("../../store/useCartStore");
jest.mock("../../store/useAuthStore");
jest.mock("react-router-dom");

const mockUseCartStore = useCartStore as jest.MockedFunction<
  typeof useCartStore
>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe("useCartPopup", () => {
  const mockCartItems = [
    {
      id: 1,
      title: "Test Product 1",
      price: 10.99,
      thumbnail: "test1.jpg",
      quantity: 2,
      stock: 5,
    },
    {
      id: 2,
      title: "Test Product 2",
      price: 15.99,
      thumbnail: "test2.jpg",
      quantity: 1,
      stock: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock cart store
    mockUseCartStore.mockReturnValue({
      userCarts: { 1: mockCartItems },
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      getItemQuantity: jest.fn(),
      clearCart: jest.fn(),
      reset: jest.fn(),
    });

    // Mock auth store
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, email: "test@example.com" },
      accessToken: "valid-token",
      refreshToken: "refresh-token",
      setUser: jest.fn(),
      setTokens: jest.fn(),
      clearTokens: jest.fn(),
      isAuthenticated: jest.fn(() => true),
      reset: jest.fn(),
    });

    // Mock navigate
    mockNavigate.mockImplementation(jest.fn());
  });

  describe("Viewing cart items", () => {
    /**
     * BDD Scenario: Viewing cart items
     *   Given I have items in my cart
     *   When I open the cart popup
     *   Then I should see all my cart items
     *   And the total price should be calculated correctly
     */
    it("should return cart items and calculated totals", () => {
      // Given: cart items are available
      const { result } = renderHook(() => useCartPopup());

      // When: accessing cart popup data
      // Then: it should return cart items and calculated totals
      expect(result.current.cartItems).toEqual(mockCartItems);
      expect(result.current.totalItems).toBe(3); // 2 + 1
      expect(result.current.totalPrice).toBe(37.97); // (10.99 * 2) + (15.99 * 1)
    });

    it("should handle empty cart", () => {
      // Given: cart is empty
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: [] },
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: accessing cart popup data
      const { result } = renderHook(() => useCartPopup());

      // Then: it should return empty cart data
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe("Updating item quantity", () => {
    /**
     * BDD Scenario: Updating item quantity in popup
     *   Given I have an item in my cart
     *   When I change the quantity in the popup
     *   Then the quantity should be updated
     *   And the total should be recalculated
     */
    it("should call updateQuantity with correct parameters", () => {
      // Given: cart store is mocked with updateQuantity function
      const mockUpdateQuantity = jest.fn();
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: mockCartItems },
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: mockUpdateQuantity,
        getItemQuantity: jest.fn(),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: changing item quantity
      const { result } = renderHook(() => useCartPopup());

      act(() => {
        result.current.handleQuantityChange(1, 3);
      });

      // Then: it should call updateQuantity with correct parameters
      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
    });

    it("should not update quantity if negative", () => {
      // Given: cart store is mocked with updateQuantity function
      const mockUpdateQuantity = jest.fn();
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: mockCartItems },
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: mockUpdateQuantity,
        getItemQuantity: jest.fn(),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: trying to set negative quantity
      const { result } = renderHook(() => useCartPopup());

      act(() => {
        result.current.handleQuantityChange(1, -1);
      });

      // Then: it should not call updateQuantity
      expect(mockUpdateQuantity).not.toHaveBeenCalled();
    });
  });

  describe("Removing items", () => {
    /**
     * BDD Scenario: Removing item from popup
     *   Given I have an item in my cart
     *   When I remove the item from the popup
     *   Then the item should be removed from cart
     *   And the popup should update accordingly
     */
    it("should call removeItem with correct product ID", () => {
      // Given: cart store is mocked with removeItem function
      const mockRemoveItem = jest.fn();
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: mockCartItems },
        addItem: jest.fn(),
        removeItem: mockRemoveItem,
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: removing an item
      const { result } = renderHook(() => useCartPopup());

      act(() => {
        result.current.handleRemoveItem(1);
      });

      // Then: it should call removeItem with correct product ID
      expect(mockRemoveItem).toHaveBeenCalledWith(1);
    });
  });

  describe("Clearing cart", () => {
    /**
     * BDD Scenario: Clearing cart from popup
     *   Given I have multiple items in my cart
     *   When I clear the cart from the popup
     *   Then all items should be removed
     *   And the popup should show empty state
     */
    it("should show modal when clearing cart", () => {
      // Given: cart popup is available
      const { result } = renderHook(() => useCartPopup());

      // When: clearing the cart
      act(() => {
        result.current.handleClearCart();
      });

      // Then: it should show confirmation modal
      expect(result.current.showClearModal).toBe(true);
    });

    it("should call clearCart when confirming", () => {
      // Given: cart store is mocked with clearCart function
      const mockClearCart = jest.fn();
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: mockCartItems },
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(),
        clearCart: mockClearCart,
        reset: jest.fn(),
      });

      // When: confirming cart clear
      const { result } = renderHook(() => useCartPopup());

      act(() => {
        result.current.handleConfirmClearCart();
      });

      // Then: it should call clearCart and hide modal
      expect(mockClearCart).toHaveBeenCalled();
      expect(result.current.showClearModal).toBe(false);
    });
  });

  describe("Proceeding to checkout", () => {
    /**
     * BDD Scenario: Proceeding to checkout
     *   Given I have items in my cart
     *   When I click proceed to checkout
     *   Then I should be navigated to checkout page
     *   And the cart should remain unchanged
     *
     * BDD Scenario: Checkout without authentication
     *   Given I am not logged in
     *   When I try to proceed to checkout
     *   Then I should be redirected to login page
     */
    it("should navigate to checkout when authenticated", () => {
      // Given: user is authenticated and has items in cart
      const { result } = renderHook(() => useCartPopup());

      // When: proceeding to checkout
      act(() => {
        result.current.handleCheckout();
      });

      // Then: it should navigate to checkout page
      expect(mockNavigate).toHaveBeenCalledWith("/checkout");
    });

    it("should navigate to login when not authenticated", () => {
      // Given: user is not authenticated
      mockUseAuthStore.mockReturnValue({
        user: null,
        accessToken: null,
        refreshToken: null,
        setUser: jest.fn(),
        setTokens: jest.fn(),
        clearTokens: jest.fn(),
        isAuthenticated: jest.fn(() => false),
        reset: jest.fn(),
      });

      // When: trying to proceed to checkout
      const { result } = renderHook(() => useCartPopup());

      act(() => {
        result.current.handleCheckout();
      });

      // Then: it should navigate to login page
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should not navigate when cart is empty", () => {
      // Given: cart is empty
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: [] },
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: trying to proceed to checkout
      const { result } = renderHook(() => useCartPopup());

      act(() => {
        result.current.handleCheckout();
      });

      // Then: it should not navigate anywhere
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
