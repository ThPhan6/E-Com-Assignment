// Purpose: Individual product card component with add-to-cart functionality
import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import type { Product } from "../types/product";
import { useCartStore } from "../store/useCartStore";
import { ApiHandler } from "../api/axiosClient";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartStore();

  // TRICKY: Handle quantity changes with stock validation
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      ApiHandler.showError("Quantity exceeds available stock", "add to cart");
      return;
    }
    setQuantity(newQuantity);
  };

  // Handle add to cart with loading state
  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);

    try {
      await addToCart(product, quantity);
      ApiHandler.showSuccess(`${product.title} added to cart!`);
      setQuantity(1); // Reset quantity after successful add
    } catch (error) {
      ApiHandler.showError(error, "add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  // Format price with discount
  const formatPrice = (price: number, discount: number) => {
    const discountedPrice = price * (1 - discount / 100);
    return {
      original: price.toFixed(2),
      discounted: discountedPrice.toFixed(2),
      discount: discount > 0 ? `${discount}% OFF` : null,
    };
  };

  const priceInfo = formatPrice(product.price, product.discountPercentage);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full">
      <div className="flex">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <LazyLoadImage
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover"
            placeholderSrc="/placeholder-image.png"
          />
          {product.discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              {priceInfo.discount}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
              {product.title}
            </h3>

            {/* Price and Rating Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-green-600">
                  ${priceInfo.discounted}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="text-xs text-gray-500 line-through">
                    ${priceInfo.original}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  ({product.rating})
                </span>
              </div>
            </div>

            {/* Stock */}
            <div className="text-xs text-gray-600 mb-2">
              Stock: {product.stock}
            </div>
          </div>

          {/* Bottom Row: Quantity and Add to Cart */}
          <div className="flex items-center justify-between">
            {/* Quantity Selector */}
            <div className="flex items-center gap-1">
              <div className="flex items-center border rounded">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-1 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  -
                </button>
                <span className="px-2 py-1 text-xs font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="px-1 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-1 px-2 rounded text-xs transition-colors duration-200 flex items-center gap-1"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : product.stock === 0 ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
