import { useState } from "react";
import {
  useCartStore,
  getProductFromUserCartItems,
  selectorTotalItems,
  selectorTotalPrice,
} from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export const useCartPopup = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const { userCarts, removeItem, updateQuantity, clearCart } = useCartStore();
  const [showClearModal, setShowClearModal] = useState(false);

  // Get cart items for current user
  const cartItems = getProductFromUserCartItems(userCarts);

  // Calculate totals
  const totalItems = selectorTotalItems(userCarts);
  const totalPrice = selectorTotalPrice(userCarts);

  // Handle quantity change
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    updateQuantity(productId, newQuantity);
  };

  // Handle item removal
  const handleRemoveItem = (productId: number) => {
    removeItem(productId);
  };

  // Handle clear cart with confirmation
  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const handleConfirmClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    navigate("/checkout");
  };

  return {
    cartItems,
    totalItems,
    totalPrice,
    accessToken,
    showClearModal,
    setShowClearModal,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
    handleConfirmClearCart,
    handleCheckout,
  };
};
