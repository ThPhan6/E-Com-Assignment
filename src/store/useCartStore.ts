import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import type { CartItem } from "../types/cart";
import { useProductStore } from "./useProductStore";
import type { Product } from "../types/product";

type MinimalCartItem = Pick<CartItem, "id" | "quantity" | "stock">;
interface UserCarts {
  [userId: number]: MinimalCartItem[];
}

interface CartState {
  userCarts: UserCarts;
  addItem: (item: Pick<CartItem, "id" | "stock">) => void;
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
        const authState = useAuthStore.getState();
        const user = authState.user;
        const token = authState.accessToken;

        // Check both user and valid token
        if (!user?.id || !token) {
          toast.error("Please log in to add items to cart");
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
                stock: Math.max(0, item.stock - 1), // Store remaining stock
              },
            ];
          }

          return {
            userCarts: { ...state.userCarts, [user.id]: newMinimal },
          };
        });
      },

      removeItem: (id) => {
        const authState = useAuthStore.getState();
        const user = authState.user;
        const token = authState.accessToken;

        // Check both user and valid token
        if (!user?.id || !token) {
          toast.error("Please log in to remove items from cart");
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
        const authState = useAuthStore.getState();
        const user = authState.user;
        const token = authState.accessToken;

        // Check both user and valid token
        if (!user?.id || !token) {
          toast.error("Please log in to update cart");
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
        const authState = useAuthStore.getState();
        const user = authState.user;
        const token = authState.accessToken;

        // Check both user and valid token
        if (!user?.id || !token) return 0;

        const userCarts = get().userCarts;
        if (!userCarts[user.id]) return 0;

        const item = userCarts[user.id].find((i) => i.id === id);
        return item ? item.quantity : 0;
      },

      clearCart: () => {
        const authState = useAuthStore.getState();
        const user = authState.user;
        const token = authState.accessToken;

        // Check both user and valid token
        if (!user?.id || !token) {
          toast.error("Please log in to clear cart");
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
): Record<number /** id */, Product> => {
  const user = useAuthStore.getState().user;
  if (!user?.id || !userCarts[user.id]) return {};

  const products = useProductStore.getState().products;

  return products.reduce((acc, product) => {
    const item = userCarts[user.id].find((i) => i.id === product.id);
    if (item) {
      acc[product.id] = {
        ...product,
        quantity: item.quantity,
        stock: item.stock,
      };
    }
    return acc;
  }, {} as Record<number, Product>);
};

export const selectorTotalItems = (userCarts: UserCarts) => {
  const user = useAuthStore.getState().user;
  if (!user?.id || !userCarts[user.id]) return 0;
  return userCarts[user.id].reduce((total, item) => total + item.quantity, 0);
};

export const selectorTotalPrice = (userCarts: UserCarts) => {
  const productCart = getProductFromUserCartItems(userCarts);
  return Object.values(productCart).reduce(
    (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
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
  if (!user?.id || !userCarts[user.id]) return originalStock;

  const cartItem = userCarts[user.id].find((item) => item.id === productId);

  // If item is in cart, return the stored remaining stock
  // If not in cart, return original stock
  return cartItem ? cartItem.stock : originalStock;
};
