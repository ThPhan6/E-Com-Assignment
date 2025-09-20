import { useAuthStore } from "./useAuthStore";
import { useLoadingStore } from "./useLoadingStore";

export const resetAllStores = () => {
  useAuthStore.getState().reset();
  useLoadingStore.getState().reset();
};
