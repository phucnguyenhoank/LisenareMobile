import { useDialogStore } from "@/stores/dialog-store";
import { ReactNode } from "react";

interface ShowDialogOptions {
  title: string;
  message: string;
  children?: ReactNode;

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
