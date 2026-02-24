import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import type { Token } from "@/types/token";

export default function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { signin } = useAuth();
  const [username, setUsername] = useState("qwer");
  const [password, setPassword] = useState("1234");
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
    onSwitch();
  };

  const handleGoogleSignIn = () => {
    Alert.alert("Google Sign In", "Coming soon!");
  };

  return (
    <>
      <Text style={styles.title}>Hello 👋</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isSubmitting ? (
        <ActivityIndicator />
      ) : (
        <Button title="Sign In" onPress={handleLogin} />
      )}

      <View style={styles.spacing} />
      <Text style={styles.smallText}>Or</Text>
      <View style={styles.spacing} />
      <Button title="Sign Up" onPress={handleSignUp} />
      <View style={styles.spacingSmall} />
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
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
});
