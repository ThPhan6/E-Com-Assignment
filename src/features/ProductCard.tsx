import { useState } from "react";
import "react-lazy-load-image-component/src/effects/blur.css";
import { selectorRemainingStock, useCartStore } from "../store/useCartStore";
import { getLocalStorageValues } from "../lib/helper";
import type { Product } from "../types/product";
import { LazyImage } from "../components/Image";

interface ProductCardProps {
  product: Product;
  onQuantityChange: (productId: number, newQuantity: number) => void;
}

export default function ProductCard({
  product,
  onQuantityChange,
}: ProductCardProps) {
  const { accessToken } = getLocalStorageValues(["accessToken"]);

  const userCarts = useCartStore((s) => s.userCarts);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  // Local quantity state (decoupled from cart)
  const [localQuantity, setLocalQuantity] = useState(0);

  // Use the shared stock calculation logic for cart quantities only
  const remainingStockAfterCart = selectorRemainingStock(
    product.id,
    product.stock,
    userCarts
  );
  // Current available stock = remaining after cart - local quantity
  const currentStock = Math.max(0, remainingStockAfterCart - localQuantity);
  const isOutOfStock = remainingStockAfterCart <= 0;

  const handleAddToCart = () => {
    // Get current cart quantity and add the local quantity
    const currentCartQuantity = getItemQuantity(product.id);
    onQuantityChange(product.id, currentCartQuantity + localQuantity);
    setLocalQuantity(0);
  };

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
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

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
              onClick={() => setLocalQuantity((q) => Math.max(0, q - 1))}
              disabled={!accessToken || isOutOfStock || localQuantity <= 0}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-default disabled:hover:bg-gray-200 disabled:border-none"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{localQuantity}</span>
            <button
              onClick={() =>
                setLocalQuantity((q) =>
                  q < remainingStockAfterCart ? q + 1 : q
                )
              }
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
            disabled={!accessToken || isOutOfStock || currentStock < 0}
            className="px-4 py-2 rounded-lg font-medium transition-colors 
             bg-green-500 hover:bg-green-600 text-black disabled:text-red
             disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50 disabled:cursor-default disabled:hover:bg-gray-300 disabled:border-none disabled:outline-none disabled:hover:text-red-500"
          >
            {isOutOfStock ? "Out of Stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
