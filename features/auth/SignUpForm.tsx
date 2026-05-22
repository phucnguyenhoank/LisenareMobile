import { request } from "@/services/client";
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
  onSwitchToSignin: () => void;
};

export default function SignUpForm({ onSwitchToSignin }: Props) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !username || !password) {
      showDialog({
        title: "Missing Information",
        message:
          "Please fill out all required fields marked with an asterisk (*).",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    if (password.length < 8) {
      showDialog({
        title: "Password Too Short",
        message:
          "Your password must be at least 8 characters long to keep your account secure.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    // 2. Username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // Allows letters, numbers, and underscores

    if (username.length < 3) {
      showDialog({
        title: "Username Too Short",
        message: "Your username must be at least 3 characters long.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    if (!usernameRegex.test(username)) {
      showDialog({
        title: "Invalid Username",
        message:
          "Usernames can only contain letters, numbers, and underscores. No spaces or special characters allowed.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showDialog({
          title: "Invalid Email Address",
          message:
            "Please enter a valid email address format (e.g., name@example.com).",
          confirmText: "OK",
          showCancel: false,
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);

      await request("/accounts", {
        method: "POST",
        body: {
          full_name: fullName.trim(),
          username,
          password,
          email: email || undefined,
        },
      });

      showDialog({
        title: "Account Created! 🎉",
        message:
          "Your registration was successful. Please log in with your new credentials.",
        confirmText: "Go to Login",
        showCancel: false,
        onConfirm: () => {
          // Clear input states on success
          setFullName("");
          setUsername("");
          setPassword("");
          setEmail("");
          onSwitchToSignin();
        },
      });
    } catch (error) {
      handleRequestError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Tạo tài khoản</Text>
      <TextInput
        placeholder="Họ và tên *"
        placeholderTextColor="#888"
        style={authStyles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        placeholder="Tên đăng nhập *"
        style={authStyles.input}
        value={username}
        onChangeText={(text) => setUsername(text.replace(/\s/g, ""))}
        autoCapitalize="none"
      />

      <View style={[authStyles.input, styles.passwordContainer]}>
        <TextInput
          placeholder="Mật khẩu *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.innerInput}
        />

        <Text
          style={styles.toggle}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "🙈" : "🐵"}
        </Text>
      </View>

      <TextInput
        placeholder="Email (bảo vệ tài khoản)"
        style={authStyles.input}
        value={email}
        onChangeText={(text) => setEmail(text.replace(/\s/g, ""))}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {isSubmitting ? (
        <ActivityIndicator />
      ) : (
        <>
          <Button
            title="Đăng ký"
            onPress={handleSignUp}
            style={{ alignSelf: "center" }}
          />
          <View style={styles.spacing} />
          <Text style={styles.smallText}>Hoặc</Text>
          <View style={styles.spacing} />
          <Button
            title="Đăng nhập"
            onPress={onSwitchToSignin}
            style={{ alignSelf: "center" }}
          />
        </>
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
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
  },

  passwordContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 0, // override the padding of the authStyles.input
  },

  innerInput: {
    paddingVertical: 16,
  },

  spacing: {
    height: 16,
  },

  smallText: {
    textAlign: "center",
    color: "#666",
  },

  toggle: {
    fontSize: 18,
    paddingHorizontal: 16,
  },
});
