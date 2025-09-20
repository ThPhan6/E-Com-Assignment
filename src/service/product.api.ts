import axiosClient from "../api/axiosClient";
import type { ProductSearchParams, ProductsResponse } from "../types/product";

export const productApi = {
  // Get all products with pagination and search
  getProducts: (params: ProductSearchParams = {}) =>
    axiosClient.get<ProductsResponse>("/products", { params }),

  // Search products by name
  searchProducts: (query: string, params: ProductSearchParams = {}) =>
    axiosClient.get<ProductsResponse>(`/products/search`, {
      params: { q: query, ...params },
    }),
};
