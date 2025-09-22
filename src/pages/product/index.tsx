import InfiniteScroll from "react-infinite-scroll-component";
import { useProduct } from "../../hooks/useProduct";
import ProductCard from "../../features/ProductCard";

export default function ProductListPage() {
  const {
    products,
    hasMore,
    loading,
    searchQuery,
    error,
    containerRef,
    fetchProducts,
    handleSearchChange,
  } = useProduct();

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
              <ProductCard key={product.id} product={product} />
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
