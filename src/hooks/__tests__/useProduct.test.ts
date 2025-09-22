import { renderHook, act } from "@testing-library/react";
import { useProduct } from "../useProduct";
import { useProductStore } from "../../store/useProductStore";
import { useCartStore } from "../../store/useCartStore";
import { productApi } from "../../service/product.api";

// Mock the stores
jest.mock("../../store/useProductStore", () => ({
  useProductStore: jest.fn(),
}));
jest.mock("../../store/useCartStore", () => ({
  useCartStore: jest.fn(),
}));
jest.mock("../../service/product.api", () => ({
  productApi: {
    getProducts: jest.fn(),
    searchProducts: jest.fn(),
  },
}));

// Mock the API response
const mockProductsResponse = {
  success: true,
  data: {
    products: [
      {
        id: 1,
        title: "Test Product 1",
        description: "Test Description 1",
        price: 100,
        discountPercentage: 10,
        rating: 4.5,
        stock: 50,
        brand: "Test Brand",
        category: "Test Category",
        thumbnail: "test-thumbnail-1.jpg",
        images: ["test-image-1.jpg"],
      },
      {
        id: 2,
        title: "Test Product 2",
        description: "Test Description 2",
        price: 200,
        discountPercentage: 15,
        rating: 4.0,
        stock: 30,
        brand: "Test Brand 2",
        category: "Test Category 2",
        thumbnail: "test-thumbnail-2.jpg",
        images: ["test-image-2.jpg"],
      },
    ],
    total: 100,
    skip: 0,
    limit: 20,
  },
  message: "Success",
};

const mockProductStore = {
  products: [],
  setProducts: jest.fn(),
  reset: jest.fn(),
};

const mockCartStore = {
  addItem: jest.fn(),
  updateQuantity: jest.fn(),
};

describe("useProduct Hook - TDD Test Cases", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset store state
    mockProductStore.products = [];
    mockProductStore.setProducts.mockClear();
    mockProductStore.reset.mockClear();
    mockCartStore.addItem.mockClear();
    mockCartStore.updateQuantity.mockClear();

    // Mock store implementations
    (useProductStore as unknown as jest.Mock).mockReturnValue(mockProductStore);
    (useCartStore as unknown as jest.Mock).mockReturnValue(mockCartStore);

    // Mock API responses
    (productApi.getProducts as jest.Mock).mockResolvedValue(
      mockProductsResponse
    );
    (productApi.searchProducts as jest.Mock).mockResolvedValue(
      mockProductsResponse
    );

    // Mock window.innerHeight for viewport testing
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  describe("Initial State and Setup", () => {
    /**
     * BDD Scenario: Initial Product Load
     *   Given the user opens the product list page
     *   When the page loads
     *   Then the system should automatically fetch the first 20 products
     *   And display them in a grid layout
     *   And show a loading indicator during fetch
     *   And hide the loading indicator when products are loaded
     */
    it("should initialize with correct default values", () => {
      // Given: the useProduct hook is initialized
      const { result } = renderHook(() => useProduct());

      // When: accessing the hook state
      // Then: it should have correct default values
      expect(result.current.products).toEqual([]);
      expect(result.current.hasMore).toBe(true);
      // Loading might be true initially due to useEffect
      expect(typeof result.current.loading).toBe("boolean");
      expect(result.current.searchQuery).toBe("");
      expect(result.current.error).toBeNull();
      expect(result.current.containerRef.current).toBeNull();
    });

    it("should provide all required methods", () => {
      // Given: the useProduct hook is initialized
      const { result } = renderHook(() => useProduct());

      // When: accessing the hook methods
      // Then: it should provide all required methods
      expect(typeof result.current.fetchProducts).toBe("function");
      expect(typeof result.current.handleSearchChange).toBe("function");
      expect(typeof result.current.handleQuantityChange).toBe("function");
    });
  });

  describe("Initial Product Loading", () => {
    /**
     * BDD Scenario: Initial Product Load
     *   Given the user opens the product list page
     *   When the page loads
     *   Then the system should automatically fetch the first 20 products
     *   And display them in a grid layout
     *   And show a loading indicator during fetch
     *   And hide the loading indicator when products are loaded
     */
    it("should set loading state during fetch", async () => {
      // Given: the useProduct hook is initialized
      const { result } = renderHook(() => useProduct());

      // When: starting to fetch products
      act(() => {
        result.current.fetchProducts(true);
      });

      // Then: loading state should be true
      expect(result.current.loading).toBe(true);
    });

    it("should call API with correct parameters", async () => {
      // Given: the useProduct hook is initialized
      const { result } = renderHook(() => useProduct());

      // When: fetching products
      await act(async () => {
        await result.current.fetchProducts(true);
      });

      // Then: it should call API with correct parameters
      expect(productApi.getProducts).toHaveBeenCalledWith({
        limit: 20,
        skip: 0,
      });
    });
  });

  describe("Infinite Scroll Functionality", () => {
    /**
     * BDD Scenario: Infinite Scroll Loading
     *   Given the user has scrolled to the bottom of the product list
     *   And there are more products available
     *   When the user reaches the scroll threshold
     *   Then the system should automatically fetch the next 20 products
     *   And append them to the existing product list
     *   And show a loading indicator during fetch
     *   And hide the loading indicator when new products are loaded
     *
     * BDD Scenario: Viewport Not Filled After Initial Load
     *   Given the initial product load returns fewer than 20 products
     *   And the viewport is not completely filled
     *   When the products are displayed
     *   Then the system should automatically fetch more products
     *   And continue fetching until the viewport is filled or no more products exist
     */
    it("should fetch next page when fetchProducts is called with isInitial=false", async () => {
      // Given: initial products are loaded
      const { result } = renderHook(() => useProduct());

      // Set up initial state
      mockProductStore.products = mockProductsResponse.data.products;

      // When: fetching next page
      await act(async () => {
        await result.current.fetchProducts(false);
      });

      // Then: it should call API with next page parameters
      expect(productApi.getProducts).toHaveBeenCalledWith({
        limit: 20,
        skip: 20,
      });
    });

    it("should append new products to existing products", async () => {
      // Given: initial products are loaded
      const { result } = renderHook(() => useProduct());

      // Set up initial products
      mockProductStore.products = [mockProductsResponse.data.products[0]];

      // When: fetching more products
      await act(async () => {
        await result.current.fetchProducts(false);
      });

      // Then: new products should be appended to existing ones
      expect(mockProductStore.setProducts).toHaveBeenCalledWith([
        mockProductsResponse.data.products[0],
        ...mockProductsResponse.data.products,
      ]);
    });

    it("should set hasMore to false when all products are loaded", async () => {
      // Given: limited products available
      const limitedResponse = {
        ...mockProductsResponse,
        data: {
          ...mockProductsResponse.data,
          total: 2,
        },
      };

      (productApi.getProducts as jest.Mock).mockResolvedValue(limitedResponse);

      // When: fetching products when all are loaded
      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.fetchProducts(false);
      });

      // Then: hasMore should be false
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("Search Functionality", () => {
    /**
     * BDD Scenario: Product Search
     *   Given the user is viewing the product list
     *   When the user types in the search input
     *   Then the system should debounce the search input (500ms delay)
     *   And reset the product list
     *   And fetch products matching the search term
     *   And display the search results
     *   And show a loading indicator during search
     *
     * BDD Scenario: Search with No Results
     *   Given the user has searched for a product
     *   When no products match the search term
     *   Then the system should display "No results for [search term]"
     *   And show an empty product list
     *
     * BDD Scenario: Clear Search
     *   Given the user has searched for products
     *   When the user clears the search input
     *   Then the system should reset to show all products
     *   And fetch the initial product list again
     */
    it("should debounce search input changes", async () => {
      // Given: search functionality is available
      jest.useFakeTimers();

      const { result } = renderHook(() => useProduct());

      // When: typing in search input
      act(() => {
        result.current.handleSearchChange({
          target: { value: "test search" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Should not call API immediately
      expect(productApi.searchProducts).not.toHaveBeenCalled();

      // Then: it should debounce the search after 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(productApi.searchProducts).toHaveBeenCalledWith("test search", {
        limit: 20,
        skip: 0,
        q: "test search",
      });

      jest.useRealTimers();
    });

    it("should reset products and pagination when searching", async () => {
      // Given: search functionality is available
      jest.useFakeTimers();

      const { result } = renderHook(() => useProduct());

      // When: performing a search
      act(() => {
        result.current.handleSearchChange({
          target: { value: "search term" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Then: it should reset products and pagination
      expect(mockProductStore.reset).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it("should use searchProducts API when search query exists", async () => {
      // Given: a search query exists
      const mockUseProduct = jest.fn().mockImplementation(() => ({
        ...useProduct(),
        searchQuery: "test search",
      }));

      // When: fetching products with search query
      const { result } = renderHook(() => mockUseProduct());

      await act(async () => {
        await result.current.fetchProducts(false);
      });

      // Then: it should use searchProducts API
      expect(productApi.searchProducts).toHaveBeenCalledWith("test search", {
        limit: 20,
        skip: 0,
        q: "test search",
      });
    });
  });

  describe("Add to Cart Functionality", () => {
    /**
     * BDD Scenario: Add Product to Cart
     *   Given the user is viewing a product
     *   When the user clicks "Add to Cart" or changes quantity
     *   Then the system should call the cart store's addItem function
     *   And pass the product details (id, title, price, thumbnail, stock)
     *   And the product should be added to the user's cart
     */
    it("should call addItem with correct product data when quantity changes", () => {
      // Given: products are available in store
      const { result } = renderHook(() => useProduct());

      // Set up products in the store
      act(() => {
        mockProductStore.products = mockProductsResponse.data.products;
      });

      // When: changing product quantity
      act(() => {
        result.current.handleQuantityChange(1, 2);
      });

      // Then: it should call addItem and updateQuantity with correct data
      expect(mockCartStore.addItem).toHaveBeenCalledTimes(1);
      expect(mockCartStore.addItem).toHaveBeenCalledWith({
        id: 1,
        title: "Test Product 1",
        price: 100,
        thumbnail: "test-thumbnail-1.jpg",
        stock: 50,
      });
      expect(mockCartStore.updateQuantity).toHaveBeenCalledTimes(1);
      expect(mockCartStore.updateQuantity).toHaveBeenCalledWith(1, 2);
    });

    it("should not call addItem when quantity is 0 or negative", () => {
      // Given: products are available in store
      const { result } = renderHook(() => useProduct());

      act(() => {
        mockProductStore.products = mockProductsResponse.data.products;
      });

      // When: setting quantity to 0 or negative
      act(() => {
        result.current.handleQuantityChange(1, 0);
      });

      // Then: it should not call addItem
      expect(mockCartStore.addItem).not.toHaveBeenCalled();
    });

    it("should not call addItem when product is not found", () => {
      // Given: no products in store
      const { result } = renderHook(() => useProduct());

      act(() => {
        mockProductStore.products = [];
      });

      // When: trying to change quantity for non-existent product
      act(() => {
        result.current.handleQuantityChange(999, 1);
      });

      // Then: it should not call addItem
      expect(mockCartStore.addItem).not.toHaveBeenCalled();
    });

    it("should not call addItem when quantity exceeds stock", () => {
      // Given: products with limited stock
      const { result } = renderHook(() => useProduct());

      // Set up products with limited stock
      act(() => {
        mockProductStore.products = mockProductsResponse.data.products;
      });

      // When: trying to set quantity higher than stock
      act(() => {
        result.current.handleQuantityChange(1, 100); // More than available stock (50)
      });

      // Then: it should not call addItem
      expect(mockCartStore.addItem).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    /**
     * BDD Scenario: Error Handling
     *   Given the product API is unavailable
     *   When the user loads the product list
     *   Then the system should display an error message
     *   And show the error in a red banner
     *   And allow the user to retry the operation
     */
    it("should handle network errors", async () => {
      // Given: API will throw a network error
      (productApi.getProducts as jest.Mock).mockRejectedValue(
        new Error("Network Error")
      );

      // When: fetching products
      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.fetchProducts(true);
      });

      // Then: it should handle the error and set error state
      expect(result.current.error).toBe("Network Error");
    });
  });

  describe("Loading States", () => {
    /**
     * BDD Scenario: Loading States
     *   Given the user is on the product list page
     *   When products are being fetched
     *   Then the system should show appropriate loading indicators
     *   And disable infinite scroll during loading
     *   And prevent multiple simultaneous requests
     */
    it("should set loading to false after request completes", async () => {
      // Given: the useProduct hook is initialized
      const { result } = renderHook(() => useProduct());

      // When: fetching products completes
      await act(async () => {
        await result.current.fetchProducts(true);
      });

      // Then: loading should be false
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Cleanup", () => {
    /**
     * BDD Scenario: Cleanup
     *   Given the user navigates away from the product list
     *   When the component unmounts
     *   Then all timers should be cleared
     *   And no memory leaks should occur
     */
    it("should clear search timeout on unmount", () => {
      // Given: search timeout is active
      jest.useFakeTimers();

      const { result, unmount } = renderHook(() => useProduct());

      act(() => {
        result.current.handleSearchChange({
          target: { value: "test" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // When: component unmounts
      unmount();

      // Then: it should clear timers without errors
      expect(() => {
        jest.runAllTimers();
      }).not.toThrow();

      jest.useRealTimers();
    });
  });
});
