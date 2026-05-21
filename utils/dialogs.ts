import { useDialogStore } from "@/stores/dialog-store";

interface ShowDialogOptions {
  title: string;
  message: string;

  confirmText?: string;
  cancelText?: string;

  showCancel?: boolean;

  onConfirm?: () => void;
  onCancel?: () => void;
}

export function showDialog(options: ShowDialogOptions) {
  useDialogStore.getState().showDialog(options);
}

export function hideDialog() {
  useDialogStore.getState().hideDialog();
}
