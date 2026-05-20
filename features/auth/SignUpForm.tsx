import { request } from "@/services/client";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Button from "@/components/Button";
import { authStyles } from "./authStyles";

type Props = {
  onSwitchToSignin: () => void;
};

export default function SignUpForm({ onSwitchToSignin }: Props) {
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
        body: {
          full_name: fullName,
          username,
          password,
          email: email || undefined,
        },
      });

      Alert.alert("Success 🎉", "Please signin.");

      setFullName("");
      setUsername("");
      setPassword("");
      setEmail("");
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        "Username already exist or your password is too short.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
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
        onChangeText={setUsername}
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
          {showPassword ? "🙈" : "👁"}
        </Text>
      </View>

      <TextInput
        placeholder="Email (bảo vệ tài khoản)"
        style={authStyles.input}
        value={email}
        onChangeText={setEmail}
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
