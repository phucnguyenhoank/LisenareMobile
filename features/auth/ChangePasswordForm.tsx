import { request } from "@/services/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Button from "@/components/Button";
import { authStyles } from "./authStyles";
import { showDialog } from "@/utils/dialogs";
import { handleRequestError } from "@/utils/handle-request-error";

type Props = {
  onCancel: () => void;
};

export default function ChangePasswordForm({ onCancel }: Props) {
  const { clearPersistedAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    // 1. Basic validation checks
    if (!oldPassword || !newPassword || !confirmPassword) {
      showDialog({
        title: "Missing Information",
        message: "Please fill out all password fields before submitting.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    if (newPassword.length < 8) {
      showDialog({
        title: "Password Too Short",
        message:
          "Your password must be at least 8 characters long to keep your account secure.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showDialog({
        title: "Passwords Do Not Match",
        message:
          "Your new password and confirmation password must be identical.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    setLoading(true);
    try {
      // 2. Call the password update endpoint
      await request("/accounts/me/password", {
        method: "PATCH",
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        },
      });

      // 3. Success state -> Inform the user and sign out cleanly
      showDialog({
        title: "Password Updated",
        message:
          "Your password has been changed successfully. Please log back in with your new credentials.",
        confirmText: "Log In Again",
        showCancel: false,
        onConfirm: clearPersistedAuth, // Clears tokens and handles navigation redirect automatically
      });
    } catch (err: any) {
      handleRequestError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Đổi mật khẩu</Text>

      <TextInput
        placeholder="Mật khẩu hiện tại"
        style={authStyles.input}
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry={true} // Ẩn mật khẩu, không có nút xem
      />

      <TextInput
        placeholder="Mật khẩu mới"
        style={authStyles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={true}
      />

      <TextInput
        placeholder="Xác nhận mật khẩu mới"
        style={authStyles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      {loading ? (
        <ActivityIndicator color={colors.secondary} size="large" />
      ) : (
        <View style={styles.buttonGroup}>
          <Button title="Hủy" onPress={onCancel} variant={"outline"} />
          <Button title="Lưu" onPress={handleChangePassword} />
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
