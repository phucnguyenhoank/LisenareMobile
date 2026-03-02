import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  timestamp: string;
}

export default function LearnerState() {
  const { token, isTokenLoading } = useAuth();
  const [stats, setStats] = useState<LearnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const data = await request<LearnerStats>("/learning-cards/stats");
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch learner stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Triggered on Pull-to-Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || isTokenLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.centered}>
        <Link href="/setting" style={styles.signinLink}>
          Đăng nhập
        </Link>
        <Text>để theo dõi tiến độ học tập</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tiến độ học tập</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.statRow}>
          <Text style={styles.label}>Đã học:</Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            {stats?.total_learning ?? 0} câu & từ
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.label}>Thành thạo:</Text>
          <Text style={styles.value}>
            {(stats?.total_learning ?? 0) - (stats?.due_count ?? 0)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.label}>Cần luyện lại:</Text>
          <Text style={[styles.value, { color: "#FF3B30" }]}>
            {stats?.due_count ?? 0}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  label: {
    fontSize: 17,
    color: "#3A3A3C",
  },
  value: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.secondary2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signinLink: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
  },
});
