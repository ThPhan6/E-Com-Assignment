// Purpose: Zustand store for product state management with pagination, search, and infinite scroll
import { create } from "zustand";
import type { Product } from "../types/product";

interface ProductState {
  // Product data
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  search: string;

  // Actions
  setProducts: (products: Product[], total: number, reset?: boolean) => void;
  addProducts: (products: Product[]) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  resetProducts: () => void;
  incrementPage: () => void;
  setHasMore: (hasMore: boolean) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  total: 0,
  page: 1,
  limit: 20,
  hasMore: true,
  loading: false,
  error: null,
  search: "",

  // Set products (for initial load or search reset)
  setProducts: (products: Product[], total: number, reset: boolean = false) => {
    set({
      products: reset ? products : [...get().products, ...products],
      total,
      hasMore: products.length === get().limit,
    });
  },

  // Add products (for infinite scroll)
  addProducts: (products: Product[]) => {
    set((state) => ({
      products: [...state.products, ...products],
      hasMore: products.length === state.limit,
    }));
  },

  // Set current page
  setPage: (page: number) => {
    set({ page });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  // Set error state
  setError: (error: string | null) => {
    set({ error });
  },

  // Set search term
  setSearch: (search: string) => {
    set({ search });
  },

  // Reset all product state
  resetProducts: () => {
    set({
      products: [],
      total: 0,
      page: 1,
      hasMore: true,
      loading: false,
      error: null,
    });
  },

  // Increment page for pagination
  incrementPage: () => {
    set((state) => ({ page: state.page + 1 }));
  },

  // Set hasMore flag
  setHasMore: (hasMore: boolean) => {
    set({ hasMore });
  },
}));
