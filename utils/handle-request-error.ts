import { ERROR_MESSAGES } from "@/config/errorMessages";

import { RequestError } from "@/services/client";

import { useToastStore } from "@/stores/toast-store";

export function handleRequestError(err: unknown) {
  const showToast = useToastStore.getState().showToast;

  if (err instanceof RequestError) {
    const message = ERROR_MESSAGES[err.error_code] || err.message;

    showToast(message, "info");

    return;
  }

  showToast("Something went wrong", "error");
}
