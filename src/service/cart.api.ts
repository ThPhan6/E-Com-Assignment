import axiosClient from "../api/axiosClient";

export const cartApi = {
  clearCart: (id: number): ApiResponse<void> =>
    axiosClient.delete(`/carts/${id}`),
};
