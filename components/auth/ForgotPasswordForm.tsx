import { request } from "@/api/client";
import colors from "@/theme/colors";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type Props = {
  onBackToSignin: () => void;
};

export default function ForgotPasswordForm({ onBackToSignin }: Props) {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleForgetPassword = async () => {
    if (!username?.trim()) {
      Alert.alert("Thông báo", "Hãy nhập tên tài khoản");
      return;
    }

    setLoading(true);

    try {
      // No logic based on response content
      await request("/accounts/forgot-password", {
        method: "POST",
        body: { username: username.trim() },
      });

      // Always move to step 2
      setStep(2);

      Alert.alert(
        "Kiểm tra email của bạn",
        "Mã OTP đã được gửi nếu tên tài khoản này tồn tại.",
      );
    } catch (err) {
      // Only show network/system errors
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword)
      return Alert.alert("Thông báo", "Hãy nhập đủ thông tin");
    setLoading(true);
    try {
      await request("/accounts/reset-password", {
        method: "POST",
        body: { username, otp, new_password: newPassword },
      });
      Alert.alert("Thành công", "Mật khẩu đã được cập nhật!", [
        { text: "Login", onPress: onBackToSignin },
      ]);
    } catch (err) {
      Alert.alert("Thông báo", "Mã OTP không hợp lệ hoặc lỗi mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {step === 1 ? "Đặt lại mật khẩu" : "Xác thực OTP"}
      </Text>
      <Text style={styles.subtitle}>
        {step === 1
          ? "Nhập tên đăng nhập của bạn"
          : "Kiểm tra mã OTP được gửi đến email đã đăng ký của bạn."}
      </Text>

      {step === 1 ? (
        <TextInput
          placeholder="Tên tài khoản"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      ) : (
        <>
          <TextInput
            placeholder="Mã OTP"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TextInput
            placeholder="Mật khẩu mới"
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </>
      )}

      {loading ? (
        <ActivityIndicator color={colors.secondary} />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={step === 1 ? handleForgetPassword : handleResetPassword}
        >
          <Text style={styles.buttonText}>
            {step === 1 ? "Gửi mã" : "Đặt lại mật khẩu"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onBackToSignin} style={styles.backButton}>
        <Text style={styles.backText}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  backButton: { marginTop: 20, alignItems: "center" },
  backText: { color: colors.secondary, fontSize: 14 },
});
