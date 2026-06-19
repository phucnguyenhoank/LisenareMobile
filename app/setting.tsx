import { request } from "@/services/client";
import ChangePasswordForm from "@/features/auth/ChangePasswordForm";
import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm";
import SignInForm from "@/features/auth/SignInForm";
import SignUpForm from "@/features/auth/SignUpForm";
import { useAuth } from "@/context/AuthContext";
import { Learner } from "@/types/learnner";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import EditableName from "@/features/setting-screen/EditableName";
import { router, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { C } from "@/theme/grammar_constants";

type AuthMode = "signin" | "signup" | "forgot";

export default function SettingScreen() {
  const params = useLocalSearchParams();
  const { token, clearPersistedAuth, isTokenLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useQuery<Learner>({
    queryKey: ["me"],
    queryFn: () => request<Learner>("/learners/me"),
    enabled: !!token,
  });

  useEffect(() => {
    if (token && params.from === "auth_required") {
      router.back();
    }
    setIsChangingPassword(false);
  }, [token]);

  if (isTokenLoading || isLoadingUser) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (token) {
    return (
      <View style={st.screen}>
        {/* Header */}

        {isChangingPassword ? (
          <ChangePasswordForm onCancel={() => setIsChangingPassword(false)} />
        ) : (
          <View style={st.content}>
            {/* Profile card */}
            <View style={st.profileCard}>
              <View style={st.avatarWrap}>
                <View style={st.avatar}>
                  <Ionicons name="person-outline" size={44} color={C.primary} />
                </View>
              </View>

              {user && <EditableName fullName={user.full_name} />}

              {user?.email && (
                <Text style={st.emailText} numberOfLines={1}>
                  Email: {user.email}
                </Text>
              )}
              <Text style={st.idText}>Mã người học: {user?.id}</Text>
            </View>

            {/* Actions */}
            <View style={st.actionsSection}>
              <TouchableOpacity
                style={st.btnPrimary}
                onPress={() => setIsChangingPassword(true)}
                activeOpacity={0.85}
              >
                <Feather name="lock" size={16} color="#fff" />
                <Text style={st.btnPrimaryText}>Đổi mật khẩu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={st.btnDanger}
                onPress={clearPersistedAuth}
                activeOpacity={0.85}
              >
                <Feather name="log-out" size={16} color="#EF4444" />
                <Text style={st.btnDangerText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Not logged in — show auth forms
  return (
    <View style={st.screen}>
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

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAF4" },
  center: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#F7FAF4",
  },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.text },

  content: { flex: 1, padding: 20, gap: 16 },

  // Profile card
  profileCard: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20, alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 2,
  },
  avatarWrap: { marginBottom: 8 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: C.primaryMid,
  },
  emailText: { fontSize: 13, color: C.textSoft, marginTop: 2 },
  idText: { fontSize: 12, color: C.textLight, marginTop: 1 },

  // Actions
  actionsSection: { gap: 10 },
  btnPrimary: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 14,
  },
  btnPrimaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnDanger: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#fff", borderRadius: 14,
    paddingVertical: 14, borderWidth: 1.5, borderColor: "#EF4444",
  },
  btnDangerText: { color: "#EF4444", fontSize: 15, fontWeight: "700" },
});
