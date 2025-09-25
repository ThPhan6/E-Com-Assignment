// Purpose: Jest tests for useProduct hook logic with BDD comments
import { renderHook, act } from "@testing-library/react";
import { useProduct } from "../useProduct";
import { useProductStore } from "../../store/useProductStore";
import { productApi } from "../../service/product.api";
import { ApiHandler } from "../../api/axiosClient";

// Mock dependencies
jest.mock("../../store/useProductStore");
jest.mock("../../service/product.api");
jest.mock("../../api/axiosClient");

const mockUseProductStore = useProductStore as jest.MockedFunction<
  typeof useProductStore
>;
const mockProductApi = productApi as jest.Mocked<typeof productApi>;
const mockApiHandler = ApiHandler as jest.Mocked<typeof ApiHandler>;

describe("useProduct", () => {
  const mockProducts = [
    {
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
      images: ["test-image1.jpg"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useProductStore return value
    mockUseProductStore.mockReturnValue({
      products: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: true,
      loading: false,
      error: null,
      search: "",
      setProducts: jest.fn(),
      addProducts: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      setSearch: jest.fn(),
      resetProducts: jest.fn(),
      incrementPage: jest.fn(),
      setHasMore: jest.fn(),
    });
  });

  describe("fetchProducts", () => {
    it("should fetch products successfully", async () => {
      // Given: Mock API response and store methods
      const mockResponse = {
        data: {
          products: mockProducts,
          total: 100,
          skip: 0,
          limit: 20,
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {
          headers: {},
        },
      } as any;
      mockProductApi.getProducts.mockResolvedValue(mockResponse);
      const mockSetProducts = jest.fn();
      const mockSetLoading = jest.fn();
      const mockSetError = jest.fn();
      const mockSetHasMore = jest.fn();

      mockUseProductStore.mockReturnValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: true,
        loading: false,
        error: null,
        search: "",
        setProducts: mockSetProducts,
        addProducts: jest.fn(),
        setLoading: mockSetLoading,
        setError: mockSetError,
        setSearch: jest.fn(),
        resetProducts: jest.fn(),
        incrementPage: jest.fn(),
        setHasMore: mockSetHasMore,
      });

      const { result } = renderHook(() => useProduct());

      // When: Fetching products
      await act(async () => {
        await result.current.fetchProducts();
      });

      // Then: Should call API and update store
      expect(mockProductApi.getProducts).toHaveBeenCalledWith({
        limit: 20,
        skip: 0,
      });
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockSetProducts).toHaveBeenCalledWith(mockProducts, 100, true);
      expect(mockSetHasMore).toHaveBeenCalledWith(false); // hasMore is false when products.length < limit
    });

    it("should handle API errors", async () => {
      // Given: Mock API error
      const mockError = new Error("API Error");
      mockProductApi.getProducts.mockRejectedValue(mockError);
      const mockSetLoading = jest.fn();
      const mockSetError = jest.fn();

      mockUseProductStore.mockReturnValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: true,
        loading: false,
        error: null,
        search: "",
        setProducts: jest.fn(),
        addProducts: jest.fn(),
        setLoading: mockSetLoading,
        setError: mockSetError,
        setSearch: jest.fn(),
        resetProducts: jest.fn(),
        incrementPage: jest.fn(),
        setHasMore: jest.fn(),
      });

      const { result } = renderHook(() => useProduct());

      // When: Fetching products with error
      await act(async () => {
        await result.current.fetchProducts();
      });

      // Then: Should handle error
      expect(mockSetError).toHaveBeenCalledWith("Failed to fetch products");
      expect(mockApiHandler.showError).toHaveBeenCalledWith(
        mockError,
        "fetch products"
      );
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe("handleSearch", () => {
    it("should handle search with term", async () => {
      // Given: Mock store methods
      const mockSetSearch = jest.fn();
      const mockResetProducts = jest.fn();

      mockUseProductStore.mockReturnValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: true,
        loading: false,
        error: null,
        search: "",
        setProducts: jest.fn(),
        addProducts: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        setSearch: mockSetSearch,
        resetProducts: mockResetProducts,
        incrementPage: jest.fn(),
        setHasMore: jest.fn(),
      });

      const { result } = renderHook(() => useProduct());

      // When: Handling search with term
      await act(async () => {
        result.current.handleSearch("test search");
      });

      // Then: Should update search and reset products
      expect(mockSetSearch).toHaveBeenCalledWith("test search");
      expect(mockResetProducts).toHaveBeenCalled();
    });

    it("should handle empty search", async () => {
      // Given: Mock store methods
      const mockSetSearch = jest.fn();
      const mockResetProducts = jest.fn();

      mockUseProductStore.mockReturnValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: true,
        loading: false,
        error: null,
        search: "",
        setProducts: jest.fn(),
        addProducts: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        setSearch: mockSetSearch,
        resetProducts: mockResetProducts,
        incrementPage: jest.fn(),
        setHasMore: jest.fn(),
      });

      const { result } = renderHook(() => useProduct());

      // When: Handling empty search
      await act(async () => {
        result.current.handleSearch("");
      });

      // Then: Should update search and reset products
      expect(mockSetSearch).toHaveBeenCalledWith("");
      expect(mockResetProducts).toHaveBeenCalled();
    });
  });

  describe("loadMore", () => {
    it("should load more when hasMore is true", () => {
      // Given: Store with hasMore true and not loading
      const mockIncrementPage = jest.fn();

      mockUseProductStore.mockReturnValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: true,
        loading: false,
        error: null,
        search: "",
        setProducts: jest.fn(),
        addProducts: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        setSearch: jest.fn(),
        resetProducts: jest.fn(),
        incrementPage: mockIncrementPage,
        setHasMore: jest.fn(),
      });

      const { result } = renderHook(() => useProduct());

      // When: Loading more
      act(() => {
        result.current.loadMore();
      });

      // Then: Should increment page
      expect(mockIncrementPage).toHaveBeenCalled();
    });

    it("should not load more when hasMore is false", () => {
      // Given: Store with hasMore false
      const mockIncrementPage = jest.fn();

      mockUseProductStore.mockReturnValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
        loading: false,
        error: null,
        search: "",
        setProducts: jest.fn(),
        addProducts: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        setSearch: jest.fn(),
        resetProducts: jest.fn(),
        incrementPage: mockIncrementPage,
        setHasMore: jest.fn(),
      });

      const { result } = renderHook(() => useProduct());

      // When: Loading more
      act(() => {
        result.current.loadMore();
      });

      // Then: Should not increment page
      expect(mockIncrementPage).not.toHaveBeenCalled();
    });

    it("should not load more when loading is true", () => {
      // Given: Store with loading true
      const mockIncrementPage = jest.fn();

      mockUseProductStore.mockReturnValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: true,
        loading: true,
        error: null,
        search: "",
        setProducts: jest.fn(),
        addProducts: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        setSearch: jest.fn(),
        resetProducts: jest.fn(),
        incrementPage: mockIncrementPage,
        setHasMore: jest.fn(),
      });

      const { result } = renderHook(() => useProduct());

      // When: Loading more
      act(() => {
        result.current.loadMore();
      });

      // Then: Should not increment page
      expect(mockIncrementPage).not.toHaveBeenCalled();
    });
  });
});
