import { request } from "@/api/client";
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
      Alert.alert("Error", "Please enter your username");
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
        "Check Your Email",
        "If an account exists with this username, a recovery code has been sent.",
      );
    } catch (err) {
      // Only show network/system errors
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return Alert.alert("Error", "Fill in all fields");
    setLoading(true);
    try {
      await request("/accounts/reset-password", {
        method: "POST",
        body: { username, otp, new_password: newPassword },
      });
      Alert.alert("Success", "Password updated!", [
        { text: "Login", onPress: onBackToSignin },
      ]);
    } catch (err) {
      Alert.alert("Error", "Invalid OTP or request failed");
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
        {step === 1 ? "Forgot Password" : "Verify OTP"}
      </Text>
      <Text style={styles.subtitle}>
        {step === 1
          ? "Enter your username to receive a reset code."
          : "Check your email for the code sent to your account."}
      </Text>

      {step === 1 ? (
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      ) : (
        <>
          <TextInput
            placeholder="Enter OTP"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TextInput
            placeholder="New Password"
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </>
      )}

      {loading ? (
        <ActivityIndicator color="#007AFF" />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={step === 1 ? handleForgetPassword : handleResetPassword}
        >
          <Text style={styles.buttonText}>
            {step === 1 ? "Send Code" : "Reset Password"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onBackToSignin} style={styles.backButton}>
        <Text style={styles.backText}>Back to Signin</Text>
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
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  backButton: { marginTop: 20, alignItems: "center" },
  backText: { color: "#007AFF", fontSize: 14 },
});
