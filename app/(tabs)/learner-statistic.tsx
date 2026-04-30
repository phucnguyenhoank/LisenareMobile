import { request } from "@/api/client";
import ChartCard from "@/components/learning-statistic/ChartCard";
import HistorySummaryCard from "@/components/learning-statistic/HistorySummaryCard";
import MemoryQualityCard from "@/components/learning-statistic/MemoryQualityCard";
import TodayOverviewCard from "@/components/learning-statistic/TodayOverviewCard";
import TextButton from "@/components/TextButton";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import {
  LearningCardStats,
  LearningTimeSeries,
  Metric,
  TimeRange,
} from "@/types/learner-statistic";
import { Learner } from "@/types/learnner";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const RANGE_TO_DAYS: Record<TimeRange, number | null> = {
  "30d": 30,
  "90d": 90,
  "365d": 365,
  all: null,
};

export default function LearnerStatisticScreen() {
  const router = useRouter();
  const { token, isTokenLoading: authLoading } = useAuth();
  const [selectedRange, setSelectedRange] = useState<TimeRange>("30d");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [selectedMetric, setSelectedMetric] =
    useState<Metric>("total_learning");

  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["learnerMe"],
    queryFn: () => request<Learner>("/learners/me"),
    enabled: !!token,
  });

  const {
    data: todayStats,
    isLoading: todayLoading,
    refetch: refetchToday,
  } = useQuery({
    queryKey: ["learnerStats", "today", timezone],
    queryFn: () =>
      request<LearningCardStats>(
        `/learning-cards/stats?days=0&timezone=${timezone}`,
      ),
    enabled: !!token,
  });

  const {
    data: allTimeStats,
    isLoading: allTimeLoading,
    refetch: refetchAllTime,
  } = useQuery({
    queryKey: ["learnerStats", "all", timezone],
    queryFn: () =>
      request<LearningCardStats>(`/learning-cards/stats?timezone=${timezone}`),
    enabled: !!token,
  });

  const days = RANGE_TO_DAYS[selectedRange];

  const {
    data: chartStats,
    isLoading: chartLoading,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ["chart", selectedMetric, selectedRange, timezone],
    queryFn: () => {
      const base = `/learning-cards/stats/timeseries?metric=${selectedMetric}`;

      const query =
        days === null
          ? `${base}&timezone=${timezone}`
          : `${base}&days=${days}&timezone=${timezone}`;

      return request<LearningTimeSeries>(query);
    },
    enabled: !!token,
  });

  const onRefresh = async () => {
    await Promise.all([
      refetchToday(),
      refetchAllTime(),
      refetchChart(),
      refetchUser(),
    ]);
  };

  const pageLoading =
    (todayLoading || allTimeLoading || userLoading) && !!token;

  if (authLoading || pageLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.center}>
        <TextButton title="Đăng nhập" onPress={() => router.push("/setting")} />
        <Text style={styles.subtitle}>để theo dõi tiến độ học tập</Text>
      </View>
    );
  }

  // TODAY
  const todayTotal = todayStats?.total_learning ?? 0;
  const todayDue = todayStats?.due_count ?? 0;
  const todayMastered = todayTotal - todayDue;

  const todayRetention = formatRetention(todayStats?.true_retention);
  const todayStability = formatDays(todayStats?.average_stability);

  // ALL TIME
  const allTimeTotal = allTimeStats?.total_learning ?? 0;
  const allTimeDue = allTimeStats?.due_count ?? 0;
  const allTimeMastered = allTimeTotal - allTimeDue;

  const allTimeRetention = formatRetention(allTimeStats?.true_retention);
  const allTimeStability = formatDays(allTimeStats?.average_stability);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={pageLoading} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.pageTitle}>Xin chào, {user?.full_name ?? "bạn"}</Text>
      <Text style={styles.pageSubtitle}>Dữ liệu học tập của bạn</Text>

      <Text style={styles.sectionTitle}>Dữ liệu của hôm nay</Text>

      <TodayOverviewCard
        total={todayTotal}
        mastered={todayMastered}
        due={todayDue}
      />

      <MemoryQualityCard
        retention={todayRetention}
        stability={todayStability}
        scope="Hôm nay"
      />

      <HistorySummaryCard
        total={allTimeTotal}
        mastered={allTimeMastered}
        due={allTimeDue}
        retention={allTimeRetention}
        stability={allTimeStability}
      />

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    padding: 20,
    paddingBottom: 120,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 20,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  pageSubtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    color: "#666",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 8,
    marginBottom: 10,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#444",
  },
});
