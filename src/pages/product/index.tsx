// Purpose: Product listing page with infinite scroll, search, and product grid
import React, { useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import InfiniteScroll from "react-infinite-scroll-component";
import { useProduct } from "../../hooks/useProduct";
import { showLoading, hideLoading } from "../../store/useLoadingStore";
import ProductCard from "../../features/ProductCard";
import { Loading } from "../../features/Loading";

const ProductListPage: React.FC = () => {
  const {
    products,
    total,
    hasMore,
    loading,
    error,
    search,
    handleSearch,
    loadMore,
    debouncedSearch,
  } = useProduct();

  const [searchInput, setSearchInput] = useState(search);

  // Handle search input change with debouncing
  const debouncedInput = useMemo(
    () =>
      debounce((value: string) => {
        debouncedSearch(value);
      }, 700),
    [debouncedSearch]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedInput(value);
    },
    [debouncedInput]
  );

  // Handle retry on error
  const handleRetry = useCallback(() => {
    if (search.trim()) {
      handleSearch(search);
    } else {
      handleSearch("");
    }
  }, [search, handleSearch]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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

        {/* Results Count */}
        {products.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Showing {products.length} of {total} products
            {search && ` for "${search}"`}
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Failed to load products
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              {search
                ? `No products match "${search}". Try a different search term.`
                : "No products available at the moment."}
            </p>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <InfiniteScroll
          dataLength={products.length}
          next={loadMore}
          hasMore={hasMore}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          loader={
            <div className="flex justify-center py-8 col-span-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-gray-600 col-span-full">
              <p>You've seen all {total} products!</p>
            </div>
          }
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </InfiniteScroll>
      )}

      {/* Loading State for Initial Load */}
      {loading && products.length === 0 && <Loading />}
    </div>
  );
};

export default ProductListPage;
