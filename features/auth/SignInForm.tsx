import colors from "@/theme/colors";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSignIn } from "./useSignIn";
import GoogleSigninButton from "@/components/GoogleSignInButton";
import Button from "@/components/Button";
import { authStyles } from "./authStyles";
import { handleRequestError } from "@/utils/handle-request-error";

type Props = {
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
};

export default function SignInForm({
  onSwitchToSignup,
  onForgotPassword,
}: Props) {
  const { signin, isSigningIn } = useSignIn();

  const [username, setUsername] = useState("prhrurcr09");
  const [password, setPassword] = useState("kcmtl5cM#");

  const handleSignin = async () => {
    try {
      await signin(username, password);
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleSignUp = () => {
    onSwitchToSignup();
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Hello 👋</Text>

      <TextInput
        placeholder="Username"
        style={authStyles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        style={authStyles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={onForgotPassword} style={styles.forgotButton}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {isSigningIn ? (
        <ActivityIndicator />
      ) : (
        <Button
          title="Đăng nhập"
          onPress={handleSignin}
          style={{ alignSelf: "center" }}
        />
      )}

      <View style={styles.spacing} />
      <Text style={styles.smallText}>Hoặc</Text>
      <View style={styles.spacing} />

      <Button
        title="Đăng ký"
        onPress={handleSignUp}
        style={{ alignSelf: "center" }}
      />

      <View style={styles.spacingSmall} />

      <GoogleSigninButton />
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

  spacing: {
    height: 16,
  },
  spacingSmall: {
    height: 12,
  },
  smallText: {
    textAlign: "center",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -12,
    paddingVertical: 4,
    marginBottom: 24,
  },
  forgotText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "500",
  },
});
