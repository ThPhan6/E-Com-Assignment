import axiosClient from "../api/axiosClient";
import type { IUser } from "../types/user";

export const userApi = {
  updateUser: (id: number, data: Partial<IUser>) =>
    axiosClient.patch(`/users/${id}`, data),
};
