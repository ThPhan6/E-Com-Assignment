import "react-lazy-load-image-component/src/effects/blur.css";
import { LazyImage } from "../components/Image";
import type { Product } from "../types/product";
import { useProductCart } from "../hooks/useProductCart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    localQuantity,
    remainingStockAfterCart,
    isOutOfStock,
    accessToken,
    handleAddToCart,
    handleQuantityChange,
  } = useProductCart(product);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <LazyImage
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-48 object-contain"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate-2">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-green-600">
            ${product.price}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {remainingStockAfterCart}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newQuantity = Math.max(0, localQuantity - 1);
                handleQuantityChange(newQuantity);
              }}
              disabled={!accessToken || isOutOfStock || localQuantity <= 0}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-default disabled:hover:bg-gray-200 disabled:border-none"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{localQuantity}</span>
            <button
              onClick={() => {
                const newQuantity =
                  localQuantity < remainingStockAfterCart
                    ? localQuantity + 1
                    : localQuantity;
                handleQuantityChange(newQuantity);
              }}
              disabled={
                !accessToken ||
                isOutOfStock ||
                localQuantity >= remainingStockAfterCart
              }
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-default disabled:hover:bg-gray-200 disabled:border-none"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!accessToken || isOutOfStock}
            className="px-4 py-2 rounded-lg font-medium transition-colors 
             bg-blue-400 hover:bg-blue-500 text-black disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-default disabled:hover:bg-gray-300 disabled:border-none disabled:outline-none disabled:text-red-500 disabled:hover:text-red-600"
          >
            {isOutOfStock ? "Out of Stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
