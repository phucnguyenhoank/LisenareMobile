import Button from "@/components/Button";
import { request } from "@/services/client";
import colors from "@/theme/colors";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { authStyles } from "./authStyles";
import { showDialog } from "@/utils/dialogs";
import { handleRequestError } from "@/utils/handle-request-error";

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
      showDialog({
        title: "Username Required",
        message: "Please enter your username or email address to proceed.",
        confirmText: "OK",
        showCancel: false,
      });
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

      showDialog({
        title: "Check Your Email",
        message:
          "A verification code (OTP) has been sent if this account exists in our system.",
        confirmText: "OK",
        showCancel: false,
      });
    } catch (err) {
      handleRequestError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      showDialog({
        title: "Missing Information",
        message:
          "Please enter both your verification code and your new password.",
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

    setLoading(true);
    try {
      await request("/accounts/reset-password", {
        method: "POST",
        body: { username, otp, new_password: newPassword },
      });
      showDialog({
        title: "Password Reset Success",
        message:
          "Your password has been updated successfully! You can now log in with your new password.",
        confirmText: "Go to Login",
        showCancel: false,
        onConfirm: onBackToSignin, // Navigates the user back to the sign-in screen
      });
    } catch (err) {
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
          style={authStyles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      ) : (
        <>
          <TextInput
            placeholder="Mã OTP"
            style={authStyles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TextInput
            placeholder="Mật khẩu mới"
            style={authStyles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </>
      )}

      {loading ? (
        <ActivityIndicator color={colors.secondary} />
      ) : (
        <Button
          onPress={step === 1 ? handleForgetPassword : handleResetPassword}
          title={step === 1 ? "Gửi mã" : "Đặt lại mật khẩu"}
          style={{ alignSelf: "center" }}
        />
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

  backButton: { marginTop: 20, alignItems: "center" },
  backText: { color: colors.secondary, fontSize: 14 },
});
