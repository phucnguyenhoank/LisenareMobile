import { ReactNode } from "react";
import { create } from "zustand";

interface DialogOptions {
  visible: boolean;

  title: string;
  message: string;
  children?: ReactNode;

  confirmText?: string;
  cancelText?: string;

  onConfirm?: () => void;
  onCancel?: () => void;

  showCancel?: boolean;
}

interface DialogState extends DialogOptions {
  showDialog: (options: Omit<DialogOptions, "visible">) => void;

  hideDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  visible: false,

  title: "",
  message: "",
  children: undefined,

  confirmText: "OK",
  cancelText: "Cancel",

  showCancel: false,

  showDialog: (options) =>
    set({
      visible: true,
      children: undefined, // Clear out old components
      ...options,
    }),

  hideDialog: () =>
    set({
      visible: false,
      children: undefined,
    }),
}));
