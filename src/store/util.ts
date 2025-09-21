import { useAuthStore } from "./useAuthStore";
import { useLoadingStore } from "./useLoadingStore";
import { useOrderStore } from "./useOrderStore";

export const resetAllStores = () => {
  useAuthStore.getState().reset();
  useLoadingStore.getState().reset();
  useOrderStore.getState().reset();
};
