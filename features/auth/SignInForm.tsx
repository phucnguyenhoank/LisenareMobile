import { C } from "@/theme/grammar_constants";
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
import { handleRequestError } from "@/utils/handle-request-error";
import Feather from "@expo/vector-icons/Feather";

type Props = {
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
};

export default function SignInForm({ onSwitchToSignup, onForgotPassword }: Props) {
  const { signin, isSigningIn } = useSignIn();
  const [username, setUsername] = useState("prhrurcr09");
  const [password, setPassword] = useState("kcmtl5cM#");
  const [showPwd, setShowPwd] = useState(false);

  const handleSignin = async () => {
    try {
      await signin(username, password);
    } catch (error) {
      handleRequestError(error);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={sf.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={sf.title}>Chào mừng bạn đã đến với Lisenare 👋</Text>

      {/* Username input */}
      <View style={sf.inputWrap}>
        <Feather name="user" size={16} color={C.textSoft} style={sf.inputIcon} />
        <TextInput
          placeholder="Tên đăng nhập hoặc email"
          placeholderTextColor={C.textLight}
          style={sf.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Password input */}
      <View style={sf.inputWrap}>
        <Feather name="lock" size={16} color={C.textSoft} style={sf.inputIcon} />
        <TextInput
          placeholder="Mật khẩu"
          placeholderTextColor={C.textLight}
          style={sf.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPwd}
        />
        <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={sf.eyeBtn}>
          <Feather name={showPwd ? "eye-off" : "eye"} size={16} color={C.textSoft} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onForgotPassword} style={sf.forgotRow}>
        <Text style={sf.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {isSigningIn ? (
        <ActivityIndicator color={C.primary} style={{ marginVertical: 8 }} />
      ) : (
        <TouchableOpacity style={sf.loginBtn} onPress={handleSignin} activeOpacity={0.85}>
          <Text style={sf.loginBtnText}>Đăng nhập</Text>
        </TouchableOpacity>
      )}

      <View style={sf.dividerRow}>
        <View style={sf.dividerLine} />
        <Text style={sf.dividerText}>Hoặc</Text>
        <View style={sf.dividerLine} />
      </View>

      <GoogleSigninButton />

      <TouchableOpacity onPress={onSwitchToSignup} style={sf.signupRow}>
        <Text style={sf.signupText}>Chưa có tài khoản? <Text style={sf.signupLink}>Đăng ký</Text></Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const sf = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: C.textSoft,
    marginBottom: 24,
    lineHeight: 18,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: C.text,
  },
  eyeBtn: { padding: 4 },
  forgotRow: { alignSelf: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 13, color: C.primary, fontWeight: "500" },
  loginBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  loginBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { fontSize: 13, color: C.textSoft },
  signupRow: { alignItems: "center", marginTop: 16 },
  signupText: { fontSize: 13, color: C.textSoft },
  signupLink: { color: C.primary, fontWeight: "600" },
});
