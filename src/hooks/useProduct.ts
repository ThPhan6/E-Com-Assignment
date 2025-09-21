import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { debounce } from "lodash";
import { useCartStore } from "../store/useCartStore";
import { productApi } from "../service/product.api";
import { useProductStore } from "../store/useProductStore";
import { requireAuth } from "../lib/authGuard";

const ITEMS_PER_PAGE = 20;

export const useProduct = () => {
  const products = useProductStore((s) => s.products);
  const setProducts = useProductStore((s) => s.setProducts);

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const addItem = useCartStore((s) => s.addItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  const containerRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<string>(searchQuery);
  // keep ref in sync
  useEffect(() => {
    searchRef.current = searchQuery;
  }, [searchQuery]);

  /**
   * fetchProducts now accepts `queryParam`. If not provided, it reads from `searchRef.current`
   * so callers can pass the exact query they want to fetch (prevents stale-closure).
   */
  const fetchProducts = useCallback(
    async (reset = false, queryParam?: string) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const query = queryParam ?? searchRef.current;
        const skip = reset ? 0 : products.length; // use products.length, not currentPage

        if (reset) {
          setProducts([]);
          setHasMore(true);
        }

        const response = query
          ? await productApi.searchProducts(query, {
              limit: ITEMS_PER_PAGE,
              skip,
            })
          : await productApi.getProducts({ limit: ITEMS_PER_PAGE, skip });

        const newProducts = response.data?.products ?? [];
        const total = response.data?.total ?? newProducts.length;

        if (reset) {
          setProducts(newProducts);
          setHasMore(newProducts.length < total);
        } else {
          const updatedProducts = [...products, ...newProducts];
          setHasMore(updatedProducts.length < total);
          setProducts(updatedProducts);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [loading, products, setProducts]
  );

  // Auto-fetch if content height < window height
  const tryAutoFill = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const contentHeight = container.scrollHeight;
    const viewportHeight = window.innerHeight;

    if (contentHeight < viewportHeight && hasMore && !loading) {
      fetchProducts(false);
    }
  }, [hasMore, loading, fetchProducts]);

  // run after products change
  useEffect(() => {
    if (!products.length) return;
    tryAutoFill();
  }, [products, tryAutoFill]);

  // Debounced API caller — receives the exact query to fetch
  const debouncedFetchProducts = useMemo(
    () =>
      debounce((q: string) => {
        // pass the query directly so fetchProducts doesn't rely on stale state
        fetchProducts(true, q);
      }, 700),
    [fetchProducts]
  );

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetchProducts.cancel();
    };
  }, [debouncedFetchProducts]);

  // initial load on mount (uses current searchRef.current which is empty string initially)
  useEffect(() => {
    fetchProducts(true, searchRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty: only on mount

  // New: explicit search handler (no useEffect hook for search)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check authentication before proceeding
    if (!requireAuth()) {
      return;
    }

    const value = e.target.value;
    setSearchQuery(value); // keep input controlled and in sync
    searchRef.current = value; // keep ref in sync for non-param fetchers
    debouncedFetchProducts(value); // debounce the API call and pass exact query
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    // Check authentication before proceeding
    if (!requireAuth()) {
      return;
    }

    if (newQuantity < 0) return;

    const currentQuantity = getItemQuantity(productId);

    // If item exists or newQuantity is zero, just update
    if (currentQuantity > 0 || newQuantity === 0) {
      updateQuantity(productId, newQuantity);
      return;
    }

    // Item doesn't exist in cart and newQuantity > 0 → add it
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    addItem({
      id: product.id,
      stock: product.stock,
      price: product.price,
      title: product.title,
      thumbnail: product.thumbnail,
    });

    // If newQuantity > 1, update to desired quantity
    if (newQuantity > 1) updateQuantity(productId, newQuantity);
  };

  return {
    products,
    hasMore,
    loading,
    searchQuery,
    error,
    containerRef,
    fetchProducts,
    setSearchQuery,
    handleSearchChange,
    handleQuantityChange,
  };
};
