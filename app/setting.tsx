import { request } from "@/api/client";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import TextButton from "@/components/TextButton";
import { useAuth } from "@/context/AuthContext";
import { Learner } from "@/types/learnner";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type AuthMode = "signin" | "signup" | "forgot";

export default function SettingScreen() {
  const { token, signout, isTokenLoading } = useAuth();
  const [user, setUser] = useState<Learner | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch user info when authenticated
  useEffect(() => {
    setIsChangingPassword(false);
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        setIsLoadingUser(true);
        const data = await request<Learner>("/learners/me");
        setUser(data);
      } catch (error) {
        console.log("Fetch user error:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

  if (isTokenLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
        <Text>Loading token...</Text>
      </View>
    );
  }

  if (isLoadingUser) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
        <Text>Loading user...</Text>
      </View>
    );
  }

  if (token) {
    return (
      <View style={styles.container}>
        {isChangingPassword ? (
          <ChangePasswordForm onCancel={() => setIsChangingPassword(false)} />
        ) : (
          <>
            <Text style={styles.title}>
              Hello, {user ? user.full_name : "expired_token"}
            </Text>
            <Text style={styles.subtitle}>Mã người học: {user?.id}</Text>
            <View style={styles.spacing} />
            <TextButton
              title="Đổi mật khẩu"
              onPress={() => setIsChangingPassword(true)}
            />
            <View style={styles.spacingSmall} />
            <TextButton
              title="Đăng xuất"
              onPress={signout}
              variant={"outline"}
            />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === "signin" && (
        <SignInForm
          onSwitchToSignup={() => setMode("signup")}
          onForgotPassword={() => setMode("forgot")}
        />
      )}

      {mode === "signup" && (
        <SignUpForm onSwitchToSignin={() => setMode("signin")} />
      )}

      {mode === "forgot" && (
        <ForgotPasswordForm onBackToSignin={() => setMode("signin")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
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
