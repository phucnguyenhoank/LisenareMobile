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
import { useQuery } from "@tanstack/react-query";
import EditableName from "@/components/setting-screen/EditableName";
import { useLocalSearchParams, useRouter } from "expo-router";

type AuthMode = "signin" | "signup" | "forgot";

export default function SettingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, signout, isTokenLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    data: user,
    isLoading: isLoadingUser,
    error,
  } = useQuery<Learner>({
    queryKey: ["me"],
    queryFn: () => request<Learner>("/learners/me"),
    enabled: !!token, // only run when token exists
  });

  useEffect(() => {
    if (token && params.from === "auth_required") {
      router.back();
    }

    setIsChangingPassword(false);
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
            {/* Profile Card */}
            <View style={styles.card}>
              {user && <EditableName fullName={user.full_name} />}
              <Text style={styles.subtitle}>Mã người học: {user?.id}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TextButton
                title="Đổi mật khẩu"
                onPress={() => setIsChangingPassword(true)}
              />

              <TextButton
                title="Đăng xuất"
                onPress={signout}
                variant={"outline"}
              />
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#f8f9fb",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  subtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
  },

  actions: {
    marginTop: 24,
    gap: 12,
  },
});
