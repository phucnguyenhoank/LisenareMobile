import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import TextButton from "../TextButton";

type Props = {
  onCancel: () => void;
};

export default function ChangePasswordForm({ onCancel }: Props) {
  const { signout } = useAuth();
  const [loading, setLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    // 1. Validation cơ bản
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
    }

    setLoading(true);
    try {
      // 2. Gọi API đổi mật khẩu
      await request("/accounts/me/password", {
        method: "PATCH",
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        },
      });

      // 3. Đổi thành công -> Thông báo và Đăng xuất
      Alert.alert(
        "Thành công",
        "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.",
        [{ text: "OK", onPress: signout }],
      );
    } catch (err: any) {
      Alert.alert("Lỗi", "Mật khẩu cũ không đúng hoặc đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Đổi mật khẩu</Text>

      <TextInput
        placeholder="Mật khẩu hiện tại"
        style={styles.input}
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry={true} // Ẩn mật khẩu, không có nút xem
      />

      <TextInput
        placeholder="Mật khẩu mới"
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={true}
      />

      <TextInput
        placeholder="Xác nhận mật khẩu mới"
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      {loading ? (
        <ActivityIndicator color={colors.secondary} size="large" />
      ) : (
        <View style={styles.buttonGroup}>
          <TextButton title="Hủy" onPress={onCancel} variant={"outline"} />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleChangePassword}
          >
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  buttonGroup: { flexDirection: "row", gap: 12 },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600" },
});
