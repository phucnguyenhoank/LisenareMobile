import { request } from "@/api/client";
import EmptyCollectionOnboarding from "@/components/collections/EmptyCollectionOnboarding";
import FilterSortModal from "@/components/collections/FilterSortModal";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { CollectionRow } from "@/components/practice-bricks/CollectionRow";
import TextButton from "@/components/TextButton";
import { PAGINATION_LIMIT } from "@/constants/api";
import { SORT_OPTIONS, STATUS_OPTIONS } from "@/constants/collections";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import type { Collection, GroupStats } from "@/types/collection";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PendingCollectionsScreen() {
  const router = useRouter();
  const { token, isTokenLoading } = useAuth();

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const currentStatusLabel =
    STATUS_OPTIONS.find((opt) => opt.value === selectedStatus)?.label ||
    "Tất cả";
  const [selectedSort, setSelectedSort] = useState("recommended");
  const currentSort =
    SORT_OPTIONS.find((sortOption) => sortOption.value === selectedSort)
      ?.label || "Đề xuất";

  const {
    data: stats = [],
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery<GroupStats[]>({
    queryKey: ["groupStats"],
    queryFn: () => request<GroupStats[]>("/collections/stats"),
    enabled: !!token,
  });

  const {
    data,
    isLoading: isCollectionsLoading, // First load of the list
    isFetching, // Any fetch (including filter changes)
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchCollections,
  } = useInfiniteQuery({
    queryKey: ["collections", selectedGroupName, selectedStatus, selectedSort],
    queryFn: ({ pageParam = 1 }) =>
      request<Collection[]>(
        `/collections/pending?` +
          new URLSearchParams({
            page: pageParam.toString(),
            limit: PAGINATION_LIMIT.toString(),
            group_name: selectedGroupName || "",
            status: selectedStatus,
            sort_by: selectedSort,
          }),
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGINATION_LIMIT ? allPages.length + 1 : undefined, // Nếu trang cuối đủ số lượng thì mới có trang tiếp
    enabled: !!selectedGroupName && !!token,
  });

  const allCollections = data?.pages.flat() ?? [];

  const onRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchCollections()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!selectedGroupName && stats.length > 0) {
      setSelectedGroupName(stats[0].group_name);
    }
  }, [stats]);

  if (isTokenLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>Đang tải thông tin người học</Text>
      </View>
    );
  }

  if (isStatsLoading && !stats.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>Đang tải dữ liệu</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.centered}>
        <TextButton title="Đăng nhập" onPress={() => router.push("/setting")} />
        <Text style={styles.subtitle}>để xem bộ sưu tập</Text>
      </View>
    );
  }

  if (token && stats.length === 0) {
    return <EmptyCollectionOnboarding onSuccess={refetchStats} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.compactFilterBar}
        onPress={() => setIsFilterVisible(true)}
      >
        <Ionicons name="options-outline" size={18} color={colors.primary} />
        <Text style={styles.filterText}>Lọc</Text>

        <Text style={styles.filterSummary} numberOfLines={1}>
          • {selectedGroupName} • {currentStatusLabel} • {currentSort}
        </Text>
      </TouchableOpacity>

      {isCollectionsLoading || (isFetching && !allCollections.length) ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Đang tìm bài học...
          </Text>
        </View>
      ) : (
        <FlatList
          data={allCollections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CollectionRow item={item} />}
          ListEmptyComponent={
            !isFetchingNextPage ? ( // Only show if we aren't currently loading more
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Không thấy bài học nào.</Text>
              </View>
            ) : null
          }
          // Tự động gọi trang tiếp theo khi cuộn gần tới đáy
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          // Chỉ hiện loading xoay xoay ở dưới cùng khi đang tải thêm trang mới
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={{ marginVertical: 20 }}
                color={colors.primary}
              />
            ) : (
              <View style={{ height: 100 }} />
            ) // Khoảng trống cuối danh sách
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <FloatingActionMenu />

      <FilterSortModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        stats={stats}
        selectedGroup={selectedGroupName}
        selectedStatus={selectedStatus}
        selectedSort={selectedSort}
        onGroupChange={(groupName) => setSelectedGroupName(groupName)}
        onStatusChange={(groupStatus) => setSelectedStatus(groupStatus)}
        onSortChange={(groupSort) => setSelectedSort(groupSort)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  compactFilterBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterText: {
    fontWeight: "600",
    marginLeft: 8,
  },
  filterSummary: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
    flex: 1,
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

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});
