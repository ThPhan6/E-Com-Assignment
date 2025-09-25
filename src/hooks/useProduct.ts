// Purpose: Hook for product operations including infinite scroll, search, and viewport filling
import { useCallback, useEffect, useRef, useMemo } from "react";
import debounce from "lodash/debounce";
import { useProductStore } from "../store/useProductStore";
import { productApi } from "../service/product.api";
import { ApiHandler } from "../api/axiosClient";
import type { ProductSearchParams } from "../types/product";

export const useProduct = () => {
  const {
    products,
    total,
    page,
    limit,
    hasMore,
    loading,
    error,
    search,
    setProducts,
    addProducts,
    setLoading,
    setError,
    setSearch,
    resetProducts,
    incrementPage,
    setHasMore,
  } = useProductStore();

  const isLoadingRef = useRef(false);
  const viewportCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch products with pagination and search
  const fetchProducts = useCallback(
    async (params: ProductSearchParams = {}) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        let response;
        if (params.q) {
          // Use search endpoint when there's a query
          response = await productApi.searchProducts(params.q, {
            limit,
            skip: (page - 1) * limit,
          });
        } else {
          // Use regular products endpoint
          response = await productApi.getProducts({
            limit,
            skip: (page - 1) * limit,
            ...params,
          });
        }

        const { products: newProducts, total: newTotal } = response.data;

        if (page === 1) {
          setProducts(newProducts, newTotal, true);
        } else {
          addProducts(newProducts);
        }

        setHasMore(newProducts.length === limit);
      } catch (error) {
        setError("Failed to fetch products");
        ApiHandler.showError(error, "fetch products");
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [page, limit, setProducts, addProducts, setLoading, setError, setHasMore]
  );

  // Handle search functionality
  const handleSearch = useCallback(
    (searchTerm: string) => {
      setSearch(searchTerm);
      resetProducts();

      if (searchTerm.trim()) {
        fetchProducts({ q: searchTerm.trim() });
      } else {
        fetchProducts();
      }
    },
    [setSearch, resetProducts, fetchProducts]
  );

  // TRICKY: Debounced search to avoid excessive API calls
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        handleSearch(term);
      }, 700),
    [handleSearch]
  );

  // Load more products for infinite scroll
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;

    incrementPage();
  }, [hasMore, loading, incrementPage]);

  // TRICKY: Check if viewport is filled and load more if needed
  const checkViewportFill = useCallback(() => {
    if (viewportCheckTimeoutRef.current) {
      clearTimeout(viewportCheckTimeoutRef.current);
    }

    viewportCheckTimeoutRef.current = setTimeout(() => {
      // Prefer the grid rendered by InfiniteScroll (has 'grid' + responsive classes)
      const grid = document.querySelector(
        ".grid.grid-cols-1"
      ) as HTMLElement | null;
      const container =
        grid || (document.scrollingElement as HTMLElement | null);
      if (!container) return;

      const containerHeight = container.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;

      const visibleBottom = scrollTop + viewportHeight;
      const contentBottom =
        container.getBoundingClientRect().top + scrollTop + containerHeight;

      // Load more when content bottom is above visible bottom (not filled) or
      // total content height is less than viewport
      if (
        (contentBottom <= visibleBottom || containerHeight < viewportHeight) &&
        hasMore &&
        !loading
      ) {
        loadMore();
      }
    }, 120);
  }, [hasMore, loading, loadMore]);

  // Initial load and search effect
  useEffect(() => {
    if (search.trim()) {
      handleSearch(search);
    } else {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check viewport fill after products change or page load
  useEffect(() => {
    // Wait a bit for the DOM to update
    const timer = setTimeout(() => {
      if (products.length > 0) {
        checkViewportFill();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [products.length, checkViewportFill]);

  // Add window resize listener to check viewport fill
  useEffect(() => {
    const handleResize = () => {
      checkViewportFill();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [checkViewportFill]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (viewportCheckTimeoutRef.current) {
        clearTimeout(viewportCheckTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    products,
    total,
    page,
    hasMore,
    loading,
    error,
    search,

    // Actions
    fetchProducts,
    handleSearch,
    loadMore,
    debouncedSearch,
    resetProducts,
  };
};
