import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import type { Token } from "@/types/token";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type Props = {
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
};

export default function SignInForm({
  onSwitchToSignup,
  onForgotPassword,
}: Props) {
  const { signin } = useAuth();
  const [username, setUsername] = useState("qwer");
  const [password, setPassword] = useState("123456789");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Thiếu thông tin", "Hãy điền đầy đủ thông tin");
      return;
    }

    try {
      setIsSubmitting(true);

      const formBody = new URLSearchParams({
        grant_type: "password",
        username,
        password,
      });

      const tokenResponse = await request<Token>("/auth/login", {
        method: "POST",
        body: formBody,
      });

      await signin(tokenResponse.access_token);

      setUsername("");
      setPassword("");
    } catch (error) {
      Alert.alert("Đăng nhập thất bại", "Sai tên đăng nhập hoặc mật khẩu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    onSwitchToSignup();
  };

  const handleGoogleSignIn = () => {
    Alert.alert("Google Sign In", "Chức năng đang phát triển");
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Hello 👋</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={onForgotPassword}
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {isSubmitting ? (
        <ActivityIndicator />
      ) : (
        <Button title="Đăng nhập" onPress={handleLogin} />
      )}

      <View style={styles.spacing} />
      <Text style={styles.smallText}>Hoặc</Text>
      <View style={styles.spacing} />
      <Button title="Đăng ký" onPress={handleSignUp} />
      <View style={styles.spacingSmall} />
      <Button title="Đăng ký với Google" onPress={handleGoogleSignIn} />
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
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
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
  spacingSmall: {
    height: 8,
  },
  smallText: {
    textAlign: "center",
  },
  passwordContainer: {
    marginBottom: 24,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -12,
    paddingVertical: 4,
  },
  forgotText: {
    color: "#007AFF",
    fontSize: 13,
    fontWeight: "500",
  },
});
