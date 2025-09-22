import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { selectorRemainingStock, useCartStore } from "../store/useCartStore";
import type { Product } from "../types/product";

export const useProductCart = (product: Product) => {
  const { accessToken } = useAuthStore();
  const { userCarts, addItemWithQuantity, getItemQuantity } = useCartStore();

  // Local state for quantity management
  const [localQuantity, setLocalQuantity] = useState(0);

  // Get current quantity in cart
  const currentQuantity = getItemQuantity(product.id);

  // Calculate remaining stock after cart
  const remainingStockAfterCart = selectorRemainingStock(
    product.id,
    product.stock,
    userCarts
  );

  // Check if product is out of stock
  const isOutOfStock = product.stock <= 0 || remainingStockAfterCart <= 0;

  // Don't sync local quantity with cart quantity
  // Local quantity should be independent and reset to 0 after adding

  // Handle add to cart
  const handleAddToCart = () => {
    if (!accessToken) {
      return;
    }

    if (isOutOfStock || localQuantity <= 0) {
      return;
    }

    // Prepare item data for cart
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      stock: product.stock,
    };

    // Add the local quantity amount to cart in one operation
    addItemWithQuantity(cartItem, localQuantity);

    // Reset local quantity to 0 after adding to cart
    setLocalQuantity(0);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > remainingStockAfterCart) {
      return;
    }
    setLocalQuantity(newQuantity);
  };

  return {
    localQuantity,
    currentQuantity,
    remainingStockAfterCart,
    isOutOfStock,
    accessToken,
    handleAddToCart,
    handleQuantityChange,
    setLocalQuantity,
  };
};
