import { router } from "expo-router";
import { Alert, AlertButton } from "react-native";

interface AlertOptions {
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  cancelable?: boolean;
}

export const showAlert = ({
  title = "Thông báo",
  message = "Xin chào bạn",
  cancelText = "Để sau",
  confirmText = "Đồng ý",
  onConfirm,
  onCancel,
  showCancel = true,
  cancelable = true,
}: AlertOptions = {}) => {
  const buttons: AlertButton[] = [];

  if (showCancel) {
    buttons.push({
      text: cancelText,
      style: "cancel",
      onPress: onCancel || (() => router.back()),
    });
  }

  buttons.push({
    text: confirmText,
    onPress: onConfirm,
  });

  Alert.alert(title, message, buttons, { cancelable });
};
