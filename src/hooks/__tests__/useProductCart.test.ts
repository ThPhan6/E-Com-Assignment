import { renderHook, act } from "@testing-library/react";
import { useProductCart } from "../useProductCart";
import { useCartStore, selectorRemainingStock } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";

// Mock dependencies
jest.mock("../../store/useCartStore");
jest.mock("../../store/useAuthStore");

const mockUseCartStore = useCartStore as jest.MockedFunction<
  typeof useCartStore
>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

// Mock selectorRemainingStock
const mockSelectorRemainingStock =
  selectorRemainingStock as jest.MockedFunction<typeof selectorRemainingStock>;

describe("useProductCart", () => {
  const mockProduct = {
    id: 1,
    title: "Test Product",
    description: "Test Description",
    price: 10.99,
    discountPercentage: 10,
    rating: 4.5,
    stock: 5,
    brand: "Test Brand",
    category: "Test Category",
    thumbnail: "test.jpg",
    images: ["test1.jpg", "test2.jpg"],
  };

  beforeEach(() => {
    jest.clearAllMocks();

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

    // Mock cart store
    mockUseCartStore.mockReturnValue({
      userCarts: { 1: [] },
      addItem: jest.fn(),
      addItemWithQuantity: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      getItemQuantity: jest.fn(() => 0),
      clearCart: jest.fn(),
      reset: jest.fn(),
    });

    // Mock selectorRemainingStock
    mockSelectorRemainingStock.mockImplementation(
      (productId, originalStock, userCarts) => {
        const user = { id: 1 };
        if (!userCarts[user.id] || !Array.isArray(userCarts[user.id])) {
          return originalStock;
        }
        const cartItem = userCarts[user.id].find(
          (item) => item.id === productId
        );
        if (cartItem) {
          return originalStock - cartItem.quantity;
        }
        return originalStock;
      }
    );
  });

  describe("Viewing product cart state", () => {
    /**
     * BDD Scenario: Viewing product cart state
     *   Given I am viewing a product
     *   When the product cart hook loads
     *   Then I should see the current quantity in cart
     *   And the remaining stock should be calculated
     */
    it("should initialize with correct default values", () => {
      // Given: a product and empty cart
      const { result } = renderHook(() => useProductCart(mockProduct));

      // When: initializing the product cart hook
      // Then: it should have correct default values
      expect(result.current.localQuantity).toBe(0);
      expect(result.current.currentQuantity).toBe(0);
      expect(result.current.remainingStockAfterCart).toBe(5);
      expect(result.current.isOutOfStock).toBe(false);
      expect(result.current.accessToken).toBe("valid-token");
    });

    it("should calculate remaining stock correctly", () => {
      // Given: cart with existing items
      mockUseCartStore.mockReturnValue({
        userCarts: {
          1: [
            {
              id: 1,
              title: "Test Product",
              price: 10.99,
              thumbnail: "test.jpg",
              quantity: 2,
              stock: 5,
            },
          ],
        },
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(() => 2),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: initializing the product cart hook
      const { result } = renderHook(() => useProductCart(mockProduct));

      // Then: it should calculate remaining stock correctly
      expect(result.current.remainingStockAfterCart).toBe(3);
      expect(result.current.currentQuantity).toBe(2);
    });

    it("should detect out of stock products", () => {
      // Given: a product with no stock
      const outOfStockProduct = { ...mockProduct, stock: 0 };

      // When: initializing the product cart hook
      const { result } = renderHook(() => useProductCart(outOfStockProduct));

      // Then: it should detect the product is out of stock
      expect(result.current.isOutOfStock).toBe(true);
    });
  });

  describe("Adding product to cart", () => {
    /**
     * BDD Scenario: Adding product to cart
     *   Given I have a product with available stock
     *   When I click add to cart
     *   Then the product should be added to cart
     *   And the local quantity should be updated
     *
     * BDD Scenario: Authentication requirements
     *   Given I am not logged in
     *   When I try to add a product to cart
     *   Then the action should be prevented
     *   And I should be prompted to log in
     */
    it("should add product to cart when authenticated", () => {
      // Given: user is authenticated and product is available
      const mockAddItemWithQuantity = jest.fn();
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: [] },
        addItem: jest.fn(),
        addItemWithQuantity: mockAddItemWithQuantity,
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(() => 0),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useProductCart(mockProduct));

      // Set local quantity first
      act(() => {
        result.current.setLocalQuantity(2);
      });

      // When: adding product to cart
      act(() => {
        result.current.handleAddToCart();
      });

      // Then: it should call addItemWithQuantity and reset local quantity
      expect(mockAddItemWithQuantity).toHaveBeenCalledTimes(1);
      expect(mockAddItemWithQuantity).toHaveBeenCalledWith(
        {
          id: 1,
          title: "Test Product",
          price: 10.99,
          thumbnail: "test.jpg",
          stock: 5,
        },
        2
      );

      // Local quantity should be reset to 0 after adding to cart
      expect(result.current.localQuantity).toBe(0);
    });

    it("should not add product when not authenticated", () => {
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

      const mockAddItem = jest.fn();
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: [] },
        addItem: mockAddItem,
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(() => 0),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: trying to add product to cart
      const { result } = renderHook(() => useProductCart(mockProduct));

      act(() => {
        result.current.handleAddToCart();
      });

      // Then: it should not add the product
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it("should not add product when out of stock", () => {
      // Given: product is out of stock
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      const mockAddItem = jest.fn();

      mockUseCartStore.mockReturnValue({
        userCarts: { 1: [] },
        addItem: mockAddItem,
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(() => 0),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      // When: trying to add out of stock product to cart
      const { result } = renderHook(() => useProductCart(outOfStockProduct));

      act(() => {
        result.current.handleAddToCart();
      });

      // Then: it should not add the product
      expect(mockAddItem).not.toHaveBeenCalled();
    });
  });

  describe("Updating product quantity", () => {
    /**
     * BDD Scenario: Updating product quantity
     *   Given I have a product in my cart
     *   When I change the quantity
     *   Then the local quantity should be updated
     *   And the cart quantity should be updated
     */
    it("should update local quantity within stock limits", () => {
      // Given: a product with available stock
      const { result } = renderHook(() => useProductCart(mockProduct));

      // When: changing quantity within stock limits
      act(() => {
        result.current.handleQuantityChange(3);
      });

      // Then: local quantity should be updated
      expect(result.current.localQuantity).toBe(3);
    });

    it("should not update quantity if it exceeds stock", () => {
      // Given: a product with limited stock
      const { result } = renderHook(() => useProductCart(mockProduct));

      // When: trying to set quantity higher than stock
      act(() => {
        result.current.handleQuantityChange(10); // More than stock of 5
      });

      // Then: local quantity should remain unchanged
      expect(result.current.localQuantity).toBe(0); // Should remain unchanged
    });

    it("should not update quantity if negative", () => {
      // Given: a product with available stock
      const { result } = renderHook(() => useProductCart(mockProduct));

      // When: trying to set negative quantity
      act(() => {
        result.current.handleQuantityChange(-1);
      });

      // Then: local quantity should remain unchanged
      expect(result.current.localQuantity).toBe(0); // Should remain unchanged
    });

    it("should not sync local quantity with cart quantity", () => {
      // Given: cart with no items initially
      mockUseCartStore.mockReturnValue({
        userCarts: { 1: [] },
        addItem: jest.fn(),
        addItemWithQuantity: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(() => 0),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      const { result, rerender } = renderHook(() =>
        useProductCart(mockProduct)
      );

      expect(result.current.localQuantity).toBe(0);

      // When: cart quantity changes
      mockUseCartStore.mockReturnValue({
        userCarts: {
          1: [
            {
              id: 1,
              title: "Test Product",
              price: 10.99,
              thumbnail: "test.jpg",
              quantity: 2,
              stock: 5,
            },
          ],
        },
        addItem: jest.fn(),
        addItemWithQuantity: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        getItemQuantity: jest.fn(() => 2),
        clearCart: jest.fn(),
        reset: jest.fn(),
      });

      rerender();

      // Then: local quantity should remain independent
      expect(result.current.localQuantity).toBe(0);
    });
  });

  describe("Stock validation", () => {
    /**
     * BDD Scenario: Stock validation
     *   Given I try to add more than available stock
     *   When I attempt to add to cart
     *   Then the action should be prevented
     *   And I should see appropriate feedback
     */
    it("should prevent adding more than available stock", () => {
      // Given: a product with limited stock
      const { result } = renderHook(() => useProductCart(mockProduct));

      // When: trying to set quantity higher than stock
      act(() => {
        result.current.handleQuantityChange(10);
      });

      // Then: local quantity should remain unchanged
      expect(result.current.localQuantity).toBe(0);
    });

    it("should allow quantity up to stock limit", () => {
      // Given: a product with available stock
      const { result } = renderHook(() => useProductCart(mockProduct));

      // When: setting quantity to stock limit
      act(() => {
        result.current.handleQuantityChange(5); // Exactly the stock limit
      });

      // Then: local quantity should be updated
      expect(result.current.localQuantity).toBe(5);
    });
  });

  describe("Out of stock handling", () => {
    /**
     * BDD Scenario: Out of stock handling
     *   Given a product is out of stock
     *   When I view the product
     *   Then the add to cart button should be disabled
     *   And I should see out of stock status
     */
    it("should disable add to cart for out of stock products", () => {
      // Given: a product that is out of stock
      const outOfStockProduct = { ...mockProduct, stock: 0 };

      // When: initializing the product cart hook
      const { result } = renderHook(() => useProductCart(outOfStockProduct));

      // Then: it should be marked as out of stock
      expect(result.current.isOutOfStock).toBe(true);
    });

    it("should show correct remaining stock for out of stock products", () => {
      // Given: a product that is out of stock
      const outOfStockProduct = { ...mockProduct, stock: 0 };

      // When: initializing the product cart hook
      const { result } = renderHook(() => useProductCart(outOfStockProduct));

      // Then: remaining stock should be 0
      expect(result.current.remainingStockAfterCart).toBe(0);
    });
  });
});
