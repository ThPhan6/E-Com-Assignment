import axiosClient from "../api/axiosClient";

export const cartApi = {
  clearCart: (id: number) => axiosClient.delete(`/carts/${id}`),
};
