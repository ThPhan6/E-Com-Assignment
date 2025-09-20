import { create } from "zustand";
import type { Product } from "../types/product";

interface ProductState {
  products: Product[];
  setProducts: (products: Product[]) => void;
  reset: () => void;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  reset: () => set({ products: [] }),
}));
