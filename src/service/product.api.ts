import axiosClient from "../api/axiosClient";

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductSearchParams {
  q?: string;
  limit?: number;
  skip?: number;
  select?: string;
}

export const productApi = {
  // Get all products with pagination and search
  getProducts: (params: ProductSearchParams = {}) =>
    axiosClient.get<ProductsResponse>("/products", { params }),

  // Get single product by ID
  getProduct: (id: number) =>
    axiosClient.get<Product>(`/products/${id}`),

  // Search products by name
  searchProducts: (query: string, params: ProductSearchParams = {}) =>
    axiosClient.get<ProductsResponse>(`/products/search`, {
      params: { q: query, ...params }
    }),

  // Get products by category
  getProductsByCategory: (category: string, params: ProductSearchParams = {}) =>
    axiosClient.get<ProductsResponse>(`/products/category/${category}`, { params }),
};
