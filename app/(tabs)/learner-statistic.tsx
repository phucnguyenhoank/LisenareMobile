import { request } from "@/services/client";
import ChartCard from "@/features/learning-statistic/ChartCard";
import HistorySummaryCard from "@/features/learning-statistic/HistorySummaryCard";
import MemoryQualityCard from "@/features/learning-statistic/MemoryQualityCard";
import TodayOverviewCard from "@/features/learning-statistic/TodayOverviewCard";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/theme/grammar_constants";
import {
  LearningCardStats,
  LearningTimeSeries,
  Metric,
  TimeRange,
} from "@/types/learner-statistic";
import { Learner } from "@/types/learnner";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RANGE_TO_DAYS: Record<TimeRange, number | null> = {
  "30d": 30,
  "90d": 90,
  "365d": 365,
  all: null,
};

export default function LearnerStatisticScreen() {
  const { token, isTokenLoading: authLoading } = useAuth();
  const [selectedRange, setSelectedRange] = useState<TimeRange>("30d");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [selectedMetric, setSelectedMetric] = useState<Metric>("total_learning");

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ["learnerMe"],
    queryFn: () => request<Learner>("/learners/me"),
    enabled: !!token,
  });

  const { data: todayStats, isLoading: todayLoading, refetch: refetchToday } = useQuery({
    queryKey: ["learnerStats", "today", timezone],
    queryFn: () => request<LearningCardStats>(`/learning-cards/stats?days=0&timezone=${timezone}`),
    enabled: !!token,
  });

  const { data: allTimeStats, isLoading: allTimeLoading, refetch: refetchAllTime } = useQuery({
    queryKey: ["learnerStats", "all", timezone],
    queryFn: () => request<LearningCardStats>(`/learning-cards/stats?timezone=${timezone}`),
    enabled: !!token,
  });

  const days = RANGE_TO_DAYS[selectedRange];

  const { data: chartStats, isLoading: chartLoading, refetch: refetchChart } = useQuery({
    queryKey: ["chart", selectedMetric, selectedRange, timezone],
    queryFn: () => {
      const base = `/learning-cards/stats/timeseries?metric=${selectedMetric}`;
      const query = days === null ? `${base}&timezone=${timezone}` : `${base}&days=${days}&timezone=${timezone}`;
      return request<LearningTimeSeries>(query);
    },
    enabled: !!token,
  });

  const onRefresh = async () => {
    await Promise.all([refetchToday(), refetchAllTime(), refetchChart(), refetchUser()]);
  };

  const pageLoading = (todayLoading || allTimeLoading || userLoading) && !!token;

  if (authLoading || pageLoading) {
    return (
      <View style={ls.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={ls.center}>
        <View style={ls.lockIcon}>
          <Feather name="bar-chart-2" size={36} color={C.primary} />
        </View>
        <Text style={ls.lockTitle}>Thống kê học tập</Text>
        <Text style={ls.lockText}>Đăng nhập để theo dõi tiến độ của bạn</Text>
        <TouchableOpacity style={ls.loginBtn} onPress={() => router.push("/setting")} activeOpacity={0.8}>
          <Text style={ls.loginBtnText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const todayTotal = todayStats?.total_learning ?? 0;
  const todayDue = todayStats?.due_count ?? 0;
  const todayMastered = todayTotal - todayDue;
  const todayRetention = formatRetention(todayStats?.true_retention);
  const todayStability = formatDays(todayStats?.average_stability);

  const allTimeTotal = allTimeStats?.total_learning ?? 0;
  const allTimeDue = allTimeStats?.due_count ?? 0;
  const allTimeMastered = allTimeTotal - allTimeDue;
  const allTimeRetention = formatRetention(allTimeStats?.true_retention);
  const allTimeStability = formatDays(allTimeStats?.average_stability);

  const firstName = user?.full_name?.split(" ").pop() ?? "bạn";

  return (
    <ScrollView
      style={ls.screen}
      contentContainerStyle={ls.container}
      refreshControl={<RefreshControl refreshing={pageLoading} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={ls.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={ls.greeting}>Xin chào, {firstName} 👋</Text>
          <Text style={ls.pageTitle}>Thống kê học tập</Text>
        </View>
      </View>

      {/* Today */}
      <Text style={ls.sectionTitle}>Số thẻ mới hôm nay</Text>
      <TodayOverviewCard total={todayTotal} mastered={todayMastered} due={todayDue} />

      <MemoryQualityCard retention={todayRetention} stability={todayStability} scope="Hôm nay" />

      {/* All time */}
      <HistorySummaryCard
        total={allTimeTotal}
        mastered={allTimeMastered}
        due={allTimeDue}
        retention={allTimeRetention}
        stability={allTimeStability}
      />

      {/* Chart */}
      <ChartCard
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        title="Biểu đồ học tập"
        data={chartStats?.data ?? []}
        loading={chartLoading}
      />
    </ScrollView>
  );
}

function formatRetention(value?: number) {
  if (value == null || Number.isNaN(value)) return "0.0%";
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(1)}%`;
}

function formatDays(value?: number) {
  if (value == null || Number.isNaN(value)) return "0.0 ngày";
  return `${value.toFixed(1)} ngày`;
}

const ls = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAF4" },
  container: { paddingBottom: 120 },

  center: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#F7FAF4", padding: 32, gap: 12,
  },
  lockIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  lockTitle: { fontSize: 20, fontWeight: "700", color: C.text },
  lockText: { fontSize: 14, color: C.textSoft, textAlign: "center" },
  loginBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 13, marginTop: 4,
  },
  loginBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  pageHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  greeting: { fontSize: 13, color: C.textSoft, marginBottom: 2 },
  pageTitle: { fontSize: 24, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3, elevation: 1,
  },

  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: C.text,
    marginBottom: 10, paddingHorizontal: 20,
  },
});
