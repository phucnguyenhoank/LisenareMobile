import { useToastStore } from "@/stores/toast-store";

/**
 * Global utility object to trigger toasts outside of React components.
 */
export const toast = {
  success: (message: string) =>
    useToastStore.getState().showToast(message, "success"),
  error: (message: string) =>
    useToastStore.getState().showToast(message, "error"),
  info: (message: string) =>
    useToastStore.getState().showToast(message, "info"),
};
