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
  addItemWithQuantity: (
    item: Omit<MinimalCartItem, "quantity">,
    quantity: number
  ) => void;
  addToCart: (product: any, quantity: number) => Promise<void>;
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
          toast.error("Please log in to add items to cart");
          return;
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          toast.error("User session expired. Please log in again.");
          return;
        }

        set((state) => {
          const currentUserCart = state.userCarts[user.id] || [];
          const existingItemIndex = currentUserCart.findIndex(
            (cartItem) => cartItem.id === item.id
          );

          let updatedCart;
          if (existingItemIndex >= 0) {
            // Item exists, update quantity
            updatedCart = [...currentUserCart];
            const newQuantity = updatedCart[existingItemIndex].quantity + 1;

            // Check stock availability
            if (newQuantity > item.stock) {
              toast.error(`Only ${item.stock} items available in stock`);
              return state;
            }

            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: newQuantity,
            };
          } else {
            // New item, add to cart
            if (item.stock <= 0) {
              toast.error("This item is out of stock");
              return state;
            }

            updatedCart = [...currentUserCart, { ...item, quantity: 1 }];
          }

          return {
            userCarts: { ...state.userCarts, [user.id]: updatedCart },
          };
        });
      },

      addItemWithQuantity: (item, quantity) => {
        // Check authentication before proceeding
        if (!requireAuth()) {
          toast.error("Please log in to add items to cart");
          return;
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          toast.error("User session expired. Please log in again.");
          return;
        }

        if (quantity <= 0) {
          toast.error("Quantity must be greater than 0");
          return;
        }

        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock`);
          return;
        }

        set((state) => {
          const currentUserCart = state.userCarts[user.id] || [];
          const existingItemIndex = currentUserCart.findIndex(
            (cartItem) => cartItem.id === item.id
          );

          let updatedCart;
          if (existingItemIndex >= 0) {
            // Item exists, update quantity
            updatedCart = [...currentUserCart];
            const newQuantity =
              updatedCart[existingItemIndex].quantity + quantity;

            // Check stock availability
            if (newQuantity > item.stock) {
              toast.error(`Only ${item.stock} items available in stock`);
              return state;
            }

            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: newQuantity,
            };
          } else {
            // New item, add to cart with specified quantity
            updatedCart = [...currentUserCart, { ...item, quantity }];
          }

          return {
            userCarts: { ...state.userCarts, [user.id]: updatedCart },
          };
        });
      },

      addToCart: async (product, quantity) => {
        // Check authentication before proceeding
        if (!requireAuth()) {
          throw new Error("Please log in to add items to cart");
        }

        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          throw new Error("User session expired. Please log in again.");
        }

        if (quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        if (quantity > product.stock) {
          throw new Error(`Only ${product.stock} items available in stock`);
        }

        // Create cart item from product
        const cartItem = {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          stock: product.stock,
          quantity,
        };

        set((state) => {
          const currentUserCart = state.userCarts[user.id] || [];
          const existingItemIndex = currentUserCart.findIndex(
            (item) => item.id === product.id
          );

          let updatedCart;
          if (existingItemIndex >= 0) {
            // Item exists, update quantity
            updatedCart = [...currentUserCart];
            const newQuantity =
              updatedCart[existingItemIndex].quantity + quantity;

            // Check stock availability
            if (newQuantity > product.stock) {
              throw new Error(`Only ${product.stock} items available in stock`);
            }

            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: newQuantity,
            };
          } else {
            // New item, add to cart
            updatedCart = [...currentUserCart, cartItem];
          }

          return {
            userCarts: { ...state.userCarts, [user.id]: updatedCart },
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
          const currentUserCart = state.userCarts[user.id] || [];
          const updatedCart = currentUserCart.filter((item) => item.id !== id);

          toast.success("Item removed from cart");
          return {
            userCarts: { ...state.userCarts, [user.id]: updatedCart },
          };
        });
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

        if (quantity < 0) {
          toast.error("Quantity cannot be negative");
          return;
        }

        set((state) => {
          const currentUserCart = state.userCarts[user.id] || [];
          const itemIndex = currentUserCart.findIndex((item) => item.id === id);

          if (itemIndex === -1) {
            toast.error("Item not found in cart");
            return state;
          }

          const item = currentUserCart[itemIndex];

          // Check stock availability
          if (quantity > item.stock) {
            toast.error(`Only ${item.stock} items available in stock`);
            return state;
          }

          let updatedCart;
          if (quantity === 0) {
            // Remove item if quantity is 0
            updatedCart = currentUserCart.filter((item) => item.id !== id);
            toast.success("Item removed from cart");
          } else {
            // Update quantity
            updatedCart = [...currentUserCart];
            updatedCart[itemIndex] = { ...item, quantity };
          }

          return {
            userCarts: { ...state.userCarts, [user.id]: updatedCart },
          };
        });
      },

      getItemQuantity: (id) => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user?.id) {
          return 0;
        }

        const currentUserCart = get().userCarts[user.id] || [];
        const item = currentUserCart.find((item) => item.id === id);
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

  // If item is in cart, calculate remaining stock
  // If not in cart, return original stock
  if (cartItem) {
    return originalStock - cartItem.quantity;
  }

  return originalStock;
};
