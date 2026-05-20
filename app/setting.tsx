import { request } from "@/services/client";
import ChangePasswordForm from "@/features/auth/ChangePasswordForm";
import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm";
import SignInForm from "@/features/auth/SignInForm";
import SignUpForm from "@/features/auth/SignUpForm";
import { useAuth } from "@/context/AuthContext";
import { Learner } from "@/types/learnner";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EditableName from "@/features/setting-screen/EditableName";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "@/components/Button";

type AuthMode = "signin" | "signup" | "forgot";

export default function SettingScreen() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newName: string) =>
      request("/learners/me", {
        method: "PATCH",
        body: { full_name: newName },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, clearPersistedAuth, isTokenLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useQuery<Learner>({
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

  if (isTokenLoading || isLoadingUser) {
    return (
      <View style={styles.container}>
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

            <View style={styles.spacing} />

            {/* Actions */}
            <Button
              title="Đổi mật khẩu"
              onPress={() => setIsChangingPassword(true)}
              style={{ alignSelf: "center" }}
            />

            <View style={styles.spacing} />

            <Button
              title="Đăng xuất"
              onPress={clearPersistedAuth}
              variant={"outline"}
              style={{ alignSelf: "center" }}
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
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fbf8",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    elevation: 1,
  },

  subtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
  },

  spacing: {
    height: 16,
  },
});
