import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import type { CartItem } from "../types/cart";
import { requireAuth } from "../lib/authGuard";

type MinimalCartItem = Pick<
  CartItem,
  "id" | "quantity" | "stock" | "price" | "title" | "thumbnail"
>;
interface UserCarts {
  [userId: number]: MinimalCartItem[];
}

interface CartState {
  userCarts: UserCarts;
  addItem: (item: Omit<MinimalCartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  getItemQuantity: (id: number) => number;
  clearCart: () => void;
  reset: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      userCarts: {},

      addItem: (item) => {
        // Check authentication before proceeding
        if (!requireAuth()) {
          return;
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          toast.error("User session expired. Please log in again.");
          return;
        }

        set((state) => {
          const userCart = state.userCarts[user.id] || [];
          const existing = userCart.find((i) => i.id === item.id);

          let newMinimal: MinimalCartItem[];

          if (existing) {
            // increment quantity
            newMinimal = userCart.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    quantity: i.quantity + 1,
                    stock: Math.max(0, item.stock - (i.quantity + 1)), // Update remaining stock
                  }
                : i
            );
          } else {
            newMinimal = [
              ...userCart,
              {
                id: item.id,
                quantity: 1,
                stock: Math.max(0, item.stock - 1),
                price: item.price,
                title: item.title,
                thumbnail: item.thumbnail,
              },
            ];
          }

          return {
            userCarts: { ...state.userCarts, [user.id]: newMinimal },
          };
        });
      },

      removeItem: (id) => {
        // Check authentication before proceeding
        if (!requireAuth()) {
          return;
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          toast.error("User session expired. Please log in again.");
          return;
        }

        set((state) => {
          const userCart = state.userCarts[user.id] || [];
          const newMinimal = userCart.filter((i) => i.id !== id);

          return {
            userCarts: { ...state.userCarts, [user.id]: newMinimal },
          };
        });

        toast.success("Item removed from cart");
      },

      updateQuantity: (id, quantity) => {
        // Check authentication before proceeding
        if (!requireAuth()) {
          return;
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          toast.error("User session expired. Please log in again.");
          return;
        }

        set((state) => {
          let newMinimal: MinimalCartItem[];

          if (quantity <= 0) {
            newMinimal = (state.userCarts[user.id] || []).filter(
              (i) => i.id !== id
            );
          } else {
            const userCart = state.userCarts[user.id] || [];
            const existingIndex = userCart.findIndex((i) => i.id === id);

            if (existingIndex >= 0) {
              // Update existing item - need to get original stock to calculate remaining
              newMinimal = userCart.map((i) => {
                if (i.id === id) {
                  // Calculate original stock from current data
                  const originalStock = i.stock + i.quantity;
                  return {
                    ...i,
                    quantity,
                    stock: Math.max(0, originalStock - quantity), // Update remaining stock
                  };
                }
                return i;
              });
            } else {
              // Item doesn't exist, this shouldn't happen in updateQuantity
              // but handle it gracefully
              newMinimal = userCart;
            }
          }

          return {
            userCarts: { ...state.userCarts, [user.id]: newMinimal },
          };
        });
      },

      getItemQuantity: (id) => {
        // Check authentication before proceeding
        if (!requireAuth()) {
          return 0;
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          return 0;
        }

        const userCarts = get().userCarts;
        if (!userCarts[user.id]) return 0;

        const item = userCarts[user.id].find((i) => i.id === id);
        return item ? item.quantity : 0;
      },

      clearCart: () => {
        // Check authentication before proceeding
        if (!requireAuth()) {
          return;
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          toast.error("User session expired. Please log in again.");
          return;
        }

        set((state) => ({
          userCarts: { ...state.userCarts, [user.id]: [] },
        }));
      },

      reset: () => {
        set({
          userCarts: {},
        });
      },
    }),
    {
      name: "cart-storage", // persisted key
    }
  )
);

export const getProductFromUserCartItems = (
  userCarts: UserCarts
): MinimalCartItem[] => {
  const user = useAuthStore.getState().user;
  if (!user?.id || !userCarts[user.id] || !Array.isArray(userCarts[user.id]))
    return [];

  return userCarts[user.id];
};

export const selectorTotalItems = (userCarts: UserCarts) => {
  const user = useAuthStore.getState().user;
  if (!user?.id || !userCarts[user.id] || !Array.isArray(userCarts[user.id]))
    return 0;
  return userCarts[user.id].reduce((total, item) => total + item.quantity, 0);
};

export const selectorTotalPrice = (userCarts: UserCarts) => {
  const user = useAuthStore.getState().user;
  if (!user?.id || !userCarts[user.id] || !Array.isArray(userCarts[user.id]))
    return 0;
  return userCarts[user.id].reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

/**
 * Calculate remaining stock for a product considering cart quantities
 * @param productId - The product ID to check
 * @param originalStock - The original stock from the product
 * @param userCarts - The user carts state
 * @returns The remaining stock available
 */
export const selectorRemainingStock = (
  productId: number,
  originalStock: number,
  userCarts: UserCarts
): number => {
  const user = useAuthStore.getState().user;
  if (!user?.id || !userCarts[user.id] || !Array.isArray(userCarts[user.id]))
    return originalStock;

  const cartItem = userCarts[user.id].find((item) => item.id === productId);

  // If item is in cart, return the stored remaining stock
  // If not in cart, return original stock
  return cartItem ? cartItem.stock : originalStock;
};
