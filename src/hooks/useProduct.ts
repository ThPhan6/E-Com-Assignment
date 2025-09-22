import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { useProductStore } from "../store/useProductStore";
import { useCartStore } from "../store/useCartStore";
import { productApi } from "../service/product.api";
import type { Product } from "../types/product";

// Constants
const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 500;

interface UseProductReturn {
  products: Product[];
  hasMore: boolean;
  loading: boolean;
  searchQuery: string;
  error: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  fetchProducts: (isInitial?: boolean) => Promise<void>;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleQuantityChange: (productId: number, quantity: number) => void;
}

export const useProduct = (): UseProductReturn => {
  // State management
  const { products, setProducts, reset } = useProductStore();
  const { addItem, updateQuantity } = useCartStore();

  // Local state
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Check if viewport is filled with products
   * If not filled, we need to fetch more products
   */
  const isViewportFilled = useCallback((): boolean => {
    if (!containerRef.current) return false;

    const container = containerRef.current;
    const containerHeight = container.offsetHeight;
    const viewportHeight = window.innerHeight;

    // If container height is less than viewport height, viewport is not filled
    return containerHeight >= viewportHeight;
  }, []);

  /**
   * Fetch products from API with pagination and search support
   */
  const fetchProducts = useCallback(
    async (isInitial: boolean = false, searchTerm?: string): Promise<void> => {
      // Prevent multiple simultaneous requests
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const skip = isInitial ? 0 : currentPage * ITEMS_PER_PAGE;
        const query = searchTerm || searchQuery;
        const params = {
          limit: ITEMS_PER_PAGE,
          skip,
          ...(query && { q: query }),
        };

        // Use search API if there's a search query, otherwise use regular products API
        const response = query
          ? await productApi.searchProducts(query, params)
          : await productApi.getProducts(params);

        if (response.data) {
          const { products: newProducts, total } = response.data;

          if (isInitial) {
            // Reset products for initial load or new search
            setProducts(newProducts);
            setCurrentPage(1);
          } else {
            // Append new products for infinite scroll
            setProducts([...products, ...newProducts]);
            setCurrentPage((prev) => prev + 1);
          }

          // Check if we have more products to load
          const totalLoaded = isInitial
            ? newProducts.length
            : products.length + newProducts.length;
          setHasMore(totalLoaded < total);

          // If viewport is not filled and we have more products, fetch more
          // Only do this for initial loads to prevent infinite loops
          if (isInitial && !isViewportFilled() && totalLoaded < total) {
            // Use setTimeout to avoid infinite recursion
            setTimeout(() => {
              fetchProducts(false);
            }, 100);
          }
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching products";
        setError(errorMessage);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading, currentPage, products, searchQuery, setProducts, isViewportFilled]
  );

  /**
   * Create a stable debounced search function
   */
  const debouncedSearch = useMemo(() => {
    return debounce((query: string) => {
      // Reset pagination and products for new search
      reset();
      setCurrentPage(0);
      setHasMore(true);

      // Create a new fetch function with the current state
      const performSearch = async () => {
        setLoading(true);
        setError(null);

        try {
          const params = {
            limit: ITEMS_PER_PAGE,
            skip: 0,
            q: query,
          };

          const response = await productApi.searchProducts(query, params);

          if (response.data) {
            const { products: newProducts, total } = response.data;
            setProducts(newProducts);
            setCurrentPage(1);
            setHasMore(newProducts.length < total);
          } else {
            throw new Error("Failed to fetch products");
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "An error occurred while fetching products";
          setError(errorMessage);
          console.error("Error fetching products:", err);
        } finally {
          setLoading(false);
        }
      };

      performSearch();
    }, SEARCH_DEBOUNCE_MS);
  }, [reset, setProducts, ITEMS_PER_PAGE]);

  /**
   * Handle search input changes with debouncing
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;

      // Update search query immediately for UI responsiveness
      setSearchQuery(query);

      // Cancel previous debounced call if exists
      debouncedSearch.cancel();

      // Start new debounced search with the query
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  /**
   * Handle quantity changes for products (add to cart with proper validation)
   */
  const handleQuantityChange = useCallback(
    (productId: number, quantity: number) => {
      // Find the product in the current products list
      const product = products.find((p) => p.id === productId);

      // Validate that we have a product and quantity is greater than 0
      if (!product || quantity <= 0 || quantity > product.stock) {
        return;
      }

      // Add the product to cart first (if not already there)
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        stock: product.stock,
      });

      // Then update the quantity to the desired amount
      // This will handle both new items and existing items correctly
      updateQuantity(productId, quantity);
    },
    [products, addItem, updateQuantity]
  );

  /**
   * Initial load effect
   */
  useEffect(() => {
    // Only fetch on initial mount if no products are loaded
    if (products.length === 0 && !loading) {
      fetchProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for initial load only

  /**
   * Cleanup debounced function on unmount
   */
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    products,
    hasMore,
    loading,
    searchQuery,
    error,
    containerRef,
    fetchProducts,
    handleSearchChange,
    handleQuantityChange,
  };
};
