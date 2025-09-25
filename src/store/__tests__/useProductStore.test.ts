// Purpose: Jest tests for product store logic with BDD comments
import { renderHook, act } from "@testing-library/react";
import { useProductStore } from "../useProductStore";
import type { Product } from "../../types/product";

// Mock product data
const mockProduct: Product = {
  id: 1,
  title: "Test Product",
  description: "Test Description",
  price: 100,
  discountPercentage: 10,
  rating: 4.5,
  stock: 50,
  brand: "Test Brand",
  category: "Test Category",
  thumbnail: "test-thumbnail.jpg",
  images: ["test-image1.jpg", "test-image2.jpg"],
};

const mockProducts: Product[] = [mockProduct];

describe("useProductStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useProductStore.setState({
      products: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: true,
      loading: false,
      error: null,
      search: "",
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      // Given: Fresh store state
      const { result } = renderHook(() => useProductStore());

      // When: Accessing store state
      // Then: Should have default values
      expect(result.current.products).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(20);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.search).toBe("");
    });
  });

  describe("setProducts", () => {
    it("should set products with reset flag", () => {
      // Given: Store with existing products
      useProductStore.setState({ products: [mockProduct] });
      const { result } = renderHook(() => useProductStore());

      // When: Setting new products with reset
      act(() => {
        result.current.setProducts(mockProducts, 100, true);
      });

      // Then: Should replace existing products
      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.total).toBe(100);
      expect(result.current.hasMore).toBe(false); // hasMore is false when products.length < limit
    });

    it("should append products without reset flag", () => {
      // Given: Store with existing products
      useProductStore.setState({ products: [mockProduct] });
      const { result } = renderHook(() => useProductStore());

      // When: Setting new products without reset
      act(() => {
        result.current.setProducts(mockProducts, 100, false);
      });

      // Then: Should append to existing products
      expect(result.current.products).toEqual([mockProduct, ...mockProducts]);
      expect(result.current.total).toBe(100);
    });
  });

  describe("addProducts", () => {
    it("should add products to existing list", () => {
      // Given: Store with existing products
      useProductStore.setState({ products: [mockProduct] });
      const { result } = renderHook(() => useProductStore());

      // When: Adding new products
      act(() => {
        result.current.addProducts(mockProducts);
      });

      // Then: Should append to existing products
      expect(result.current.products).toEqual([mockProduct, ...mockProducts]);
    });

    it("should update hasMore based on product count", () => {
      // Given: Store with limit of 20
      useProductStore.setState({ limit: 20 });
      const { result } = renderHook(() => useProductStore());

      // When: Adding 20 products (full page)
      const fullPageProducts = Array(20).fill(mockProduct);
      act(() => {
        result.current.addProducts(fullPageProducts);
      });

      // Then: hasMore should be true
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe("setPage", () => {
    it("should update current page", () => {
      // Given: Store with page 1
      const { result } = renderHook(() => useProductStore());

      // When: Setting page to 2
      act(() => {
        result.current.setPage(2);
      });

      // Then: Page should be updated
      expect(result.current.page).toBe(2);
    });
  });

  describe("setLoading", () => {
    it("should update loading state", () => {
      // Given: Store with loading false
      const { result } = renderHook(() => useProductStore());

      // When: Setting loading to true
      act(() => {
        result.current.setLoading(true);
      });

      // Then: Loading should be true
      expect(result.current.loading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should update error state", () => {
      // Given: Store with no error
      const { result } = renderHook(() => useProductStore());

      // When: Setting error message
      act(() => {
        result.current.setError("Test error");
      });

      // Then: Error should be set
      expect(result.current.error).toBe("Test error");
    });

    it("should clear error when set to null", () => {
      // Given: Store with existing error
      useProductStore.setState({ error: "Existing error" });
      const { result } = renderHook(() => useProductStore());

      // When: Setting error to null
      act(() => {
        result.current.setError(null);
      });

      // Then: Error should be cleared
      expect(result.current.error).toBeNull();
    });
  });

  describe("setSearch", () => {
    it("should update search term", () => {
      // Given: Store with empty search
      const { result } = renderHook(() => useProductStore());

      // When: Setting search term
      act(() => {
        result.current.setSearch("test search");
      });

      // Then: Search should be updated
      expect(result.current.search).toBe("test search");
    });
  });

  describe("resetProducts", () => {
    it("should reset all product state", () => {
      // Given: Store with populated state
      useProductStore.setState({
        products: mockProducts,
        total: 100,
        page: 3,
        hasMore: false,
        loading: true,
        error: "Test error",
      });
      const { result } = renderHook(() => useProductStore());

      // When: Resetting products
      act(() => {
        result.current.resetProducts();
      });

      // Then: Should return to initial state
      expect(result.current.products).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("incrementPage", () => {
    it("should increment page by 1", () => {
      // Given: Store with page 1
      useProductStore.setState({ page: 1 });
      const { result } = renderHook(() => useProductStore());

      // When: Incrementing page
      act(() => {
        result.current.incrementPage();
      });

      // Then: Page should be 2
      expect(result.current.page).toBe(2);
    });
  });

  describe("setHasMore", () => {
    it("should update hasMore flag", () => {
      // Given: Store with hasMore true
      const { result } = renderHook(() => useProductStore());

      // When: Setting hasMore to false
      act(() => {
        result.current.setHasMore(false);
      });

      // Then: hasMore should be false
      expect(result.current.hasMore).toBe(false);
    });
  });
});
