import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { showAlert } from "@/utils/alerts";
import { Link, useRouter } from "expo-router";
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
}

interface LearnerMe {
  id: number;
  full_name: string;
}

export default function LearnerState() {
  const router = useRouter();
  const { token, isTokenLoading } = useAuth();

  const [stats, setStats] = useState<LearnerStats | null>(null);
  const [user, setUser] = useState<LearnerMe | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!token) return;

    try {
      const [statsData, userData] = await Promise.all([
        request<LearnerStats>("/learning-cards/stats"),
        request<LearnerMe>("/learners/me"),
      ]);

      setStats(statsData);
      setUser(userData);
    } catch (err: any) {
      if (err.status == 401) {
        showAlert({
          title: "Phiên đăng nhập hết hạn",
          message: "Hãy đăng nhập lại",
          confirmText: "Đăng nhập",
          onConfirm: () => {
            router.push("/setting");
          },
          showCancel: false,
          cancelable: false,
        });
      } else {
        console.error("Failed to fetch learner data:", err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  if (loading || isTokenLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* User Info */}
      <Text style={styles.name}>{user?.full_name}</Text>
      <Text style={styles.id}>Mã người học: {user?.id}</Text>

      {/* Stats */}
      <View style={styles.card}>
        <Stat
          label="Đã học"
          value={`${total} câu & từ`}
          color={colors.primary}
        />
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
    marginBottom: 2,
  },

  id: {
    color: "#666",
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
