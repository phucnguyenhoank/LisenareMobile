import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { Learner } from "@/types/learnner";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface LearnerStats {
  learner_id: number;
  total_learning: number;
  due_count: number;
}

export default function LearnerStatisticScreen() {
  const { token, isTokenLoading: authLoading } = useAuth();

  // Fetch Stats
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["learnerStats"],
    queryFn: () => request<LearnerStats>("/learning-cards/stats"),
    enabled: !!token,
  });

  // Fetch User Profile
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["learnerMe"],
    queryFn: () => request<Learner>("/learners/me"),
    enabled: !!token,
  });

  const onRefresh = async () => {
    await Promise.all([refetchStats(), refetchUser()]);
  };

  // 1. Show loader only if we are actually waiting for the token or data
  const dataLoading = (statsLoading || userLoading) && !!token;
  if (authLoading || dataLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  // 2. Show sign-in view if no token
  if (!token) {
    return (
      <View style={styles.center}>
        <Link href="/setting" style={styles.signinLink}>
          Đăng nhập
        </Link>
        <Text>để theo dõi tiến độ học tập</Text>
      </View>
    );
  }

  const total = stats?.total_learning ?? 0;
  const due = stats?.due_count ?? 0;
  const mastered = total - due;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={statsLoading || userLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <Text style={styles.name}>{user?.full_name}</Text>

      <View style={styles.card}>
        <Stat label="Đã học" value={`${total} câu`} color={colors.primary} />
        <Stat label="Thành thạo" value={mastered} />
        <Stat label="Cần luyện lại" value={due} color="#FF3B30" />
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, color }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color && { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F2F2F7",
    flexGrow: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  label: {
    fontSize: 16,
    color: "#444",
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary2,
  },

  signinLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
  },
});
