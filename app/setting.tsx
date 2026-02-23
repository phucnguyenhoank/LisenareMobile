import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import type { Token } from "@/types/token";

interface User {
  id: number;
  full_name: string;
}

export default function SettingScreen() {
  const { token, login, logout, isTokenLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

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
        console.log("Failed to fetch user:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogin = async () => {
    const formBody = new URLSearchParams({
      grant_type: "password",
      username: "qwer",
      password: "1234",
    });

    const tokenResponse = await request<Token>("/auth/login", {
      method: "POST",
      body: formBody,
    });

    await login(tokenResponse.access_token);
  };

  if (isTokenLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!token ? (
        <>
          <Text style={styles.greetingText}>Hello, Guest 👋</Text>
          <Button title="Sign In" onPress={handleLogin} />
        </>
      ) : isLoadingUser ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.greetingText}>Welcome, {user?.full_name}</Text>
          <Text style={styles.userIdText}>User ID: {user?.id}</Text>
          <Button title="Log Out" onPress={logout} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16, // works in modern React Native
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  userIdText: {
    fontSize: 14,
    color: "#666",
  },
});
