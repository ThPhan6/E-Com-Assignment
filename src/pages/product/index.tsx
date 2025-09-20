import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce } from "lodash";
import { useCartStore } from "../../store/useCartStore";
import { productApi } from "../../service/product.api";
import ProductCard from "../../components/ProductCard";
import { useProductStore } from "../../store/useProductStore";

const ITEMS_PER_PAGE = 20;

export default function ProductListPage() {
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
    tryAutoFill();
  }, [products, tryAutoFill]);

  // Debounced API caller — receives the exact query to fetch
  const debouncedFetchProducts = useMemo(
    () =>
      debounce((q: string) => {
        // pass the query directly so fetchProducts doesn't rely on stale state
        fetchProducts(true, q);
      }, 500),
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
    const value = e.target.value;
    setSearchQuery(value); // keep input controlled and in sync
    searchRef.current = value; // keep ref in sync for non-param fetchers
    debouncedFetchProducts(value); // debounce the API call and pass exact query
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
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

    addItem({ id: product.id, stock: product.stock });

    // If newQuantity > 1, update to desired quantity
    if (newQuantity > 1) updateQuantity(productId, newQuantity);
  };

  return (
    <div className="mx-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4"></h1>

        {/* Search Bar (controlled input) */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div ref={containerRef}>
        <InfiniteScroll
          dataLength={products.length}
          next={() => fetchProducts(false)}
          hasMore={hasMore && !loading}
          scrollThreshold={0.6}
          loader={
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-gray-500">
              {!loading && products.length === 0
                ? searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No products found"
                : "All products loaded"}
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>

      {/* Initial Loading */}
      {loading && products.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      )}
    </div>
  );
}
