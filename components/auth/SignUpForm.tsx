import { request } from "@/api/client";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !username || !password) {
      Alert.alert(
        "Thiếu thông tin",
        "Hãy điền đầy đủ thông tin được đánh dấu *",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await request("/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          username,
          password,
          email: email || undefined,
        }),
      });

      Alert.alert("Success 🎉", "Account created successfully. Please signin.");

      // Optional: clear form
      setFullName("");
      setUsername("");
      setPassword("");
      setEmail("");
    } catch (error) {
      Alert.alert("Sign Up Failed", "Username may already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Tạo tài khoản</Text>

      <TextInput
        placeholder="Họ và tên *"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        placeholder="Tên đăng nhập *"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mật khẩu *"
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />

        <Text
          style={styles.toggle}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "🙈" : "👁"}
        </Text>
      </View>

      <TextInput
        placeholder="Email (khuyến nghị)"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {isSubmitting ? (
        <ActivityIndicator />
      ) : (
        <>
          <Button title="Đăng ký" onPress={handleSignUp} />
          <View style={styles.spacing} />
          <Text style={styles.smallText}>Hoặc</Text>
          <View style={styles.spacing} />
          <Button title="Đã có tài khoản? Đăng nhập" onPress={onSwitch} />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  spacing: {
    height: 16,
  },
  smallText: {
    textAlign: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },

  toggle: {
    fontSize: 18,
  },
});
