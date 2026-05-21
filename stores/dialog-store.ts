import { create } from "zustand";

interface DialogOptions {
  visible: boolean;

  title: string;
  message: string;

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

  confirmText: "OK",
  cancelText: "Cancel",

  showCancel: false,

  showDialog: (options) =>
    set({
      visible: true,
      ...options,
    }),

  hideDialog: () =>
    set({
      visible: false,
    }),
}));
