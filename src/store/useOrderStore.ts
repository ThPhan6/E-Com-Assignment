import { create } from "zustand";
import type { Order } from "../types/checkout";

interface OrderState {
  lastOrder: Order | null;
  setLastOrder: (order: Order | null) => void;
  reset: () => void;
}

// Note: No localStorage persistence - order data only exists in memory during session
export const useOrderStore = create<OrderState>()((set) => ({
  lastOrder: null,
  setLastOrder: (order) => set({ lastOrder: order }),
  reset: () => set({ lastOrder: null }),
}));
