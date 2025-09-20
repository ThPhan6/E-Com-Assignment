import { useState } from "react";
import { useCartStore } from "../store/useCartStore";
import type { Product } from "../service/product.api";
import { PATH } from "../lib/route";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuantityChange: (productId: number, newQuantity: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  // Store reference quantity in cart
  const cartQuantity = useCartStore((s) => {
    const item = s.items.find((item) => item.id === product.id);
    return item ? item.quantity : 0;
  });

  // Local quantity state (decoupled from cart)
  const [localQuantity, setLocalQuantity] = useState(0);

  const getCurrentStock = () => {
    return Math.max(0, product.stock - cartQuantity - localQuantity);
  };

  const currentStock = getCurrentStock();
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (!accessToken) {
      navigate(PATH.LOGIN);
      return;
    }
    if (localQuantity <= 0 || currentStock < 0) return;

    for (let i = 0; i < localQuantity; i++) {
      onAddToCart(product);
    }
    setLocalQuantity(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={
            product.thumbnail ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={product.title}
          className="w-full h-48 object-contain"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-black font-bold text-lg">Out of Stock</span>
          </div>
        )}
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
          <span className="text-sm text-gray-500">Stock: {currentStock}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLocalQuantity((q) => Math.max(0, q - 1))}
              disabled={isOutOfStock || localQuantity <= 0}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 
             hover:bg-gray-300 
             disabled:opacity-50 disabled:cursor-default disabled:hover:bg-gray-200"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{localQuantity}</span>
            <button
              onClick={() =>
                setLocalQuantity((q) => (q < currentStock ? q + 1 : q))
              }
              disabled={isOutOfStock || localQuantity >= currentStock}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 
             hover:bg-gray-300 
             disabled:opacity-50 disabled:cursor-default disabled:hover:bg-gray-200"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || localQuantity <= 0}
            className="px-4 py-2 rounded-lg font-medium transition-colors 
             bg-green-500 hover:bg-green-600 text-black 
             disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50 disabled:cursor-default disabled:hover:bg-gray-300"
          >
            {isOutOfStock ? "Out of Stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
