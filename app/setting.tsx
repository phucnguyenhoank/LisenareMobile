import { request } from "@/api/client";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface User {
  id: number;
  full_name: string;
}

type AuthMode = "signin" | "signup";

export default function SettingScreen() {
  const { token, signout, isTokenLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");

  // Fetch user info when authenticated
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        setIsLoadingUser(true);
        const data = await request<User>("/learners/me");
        setUser(data);
      } catch (error) {
        console.log("Fetch user error:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Coming soon.");
  };

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
        <Text style={styles.title}>
          Hello, {user ? user.full_name : "expired_token"}
        </Text>
        <Text style={styles.subtitle}>Mã người học: {user?.id}</Text>
        <View style={styles.spacing} />
        <Button title="Đổi mật khẩu" onPress={handleChangePassword} />
        <View style={styles.spacingSmall} />
        <Button title="Đăng xuất" onPress={signout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === "signin" ? (
        <SignInForm onSwitch={() => setMode("signup")} />
      ) : (
        <SignUpForm onSwitch={() => setMode("signin")} />
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
