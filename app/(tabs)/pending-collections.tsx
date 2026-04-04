import { request } from "@/api/client";
import EmptyCollectionOnboarding from "@/components/collections/EmptyCollectionOnboarding";
import FilterSortModal from "@/components/collections/FilterSortModal";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { CollectionRow } from "@/components/practice-bricks/CollectionRow";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import type { Collection, GroupStats } from "@/types/collection";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LIMIT = 20;

export default function CollectionScreen() {
  const { token, isTokenLoading } = useAuth();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: stats = [],
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery<GroupStats[]>({
    queryKey: ["groupStats"],
    queryFn: () => request<GroupStats[]>("/collections/stats"),
    enabled: !!token,
  });

  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!selectedGroupName && stats.length > 0) {
      setSelectedGroupName(stats[0].group_name);
    }
  }, [stats]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchCollections,
  } = useInfiniteQuery({
    queryKey: ["collections", selectedGroupName],
    queryFn: ({ pageParam = 1 }) =>
      request<Collection[]>(
        `/collections/pending?page=${pageParam}&limit=${LIMIT}&group_name=${encodeURIComponent(selectedGroupName!)}`,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === LIMIT ? allPages.length + 1 : undefined, // Nếu trang cuối đủ số lượng thì mới có trang tiếp
    enabled: !!selectedGroupName && !!token,
  });
  const allCollections = data?.pages.flat() ?? [];

  const handleGroupNameChange = (groupName: string) => {
    setSelectedGroupName(groupName);
  };

  const onRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchCollections()]);
    } finally {
      setRefreshing(false);
    }
  };

  // If stats are still loading or we haven't picked a group yet
  if (isTokenLoading || isStatsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>Đang tải bộ sưu tập của bạn...</Text>
      </View>
    );
  }

  // Not authenticated
  if (!token) {
    return (
      <View style={styles.centered}>
        <Link href="/setting" style={styles.signinLink}>
          Đăng nhập
        </Link>
        <Text>để xem bộ sưu tập</Text>
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
          • {selectedGroupName} • Tất cả
        </Text>
      </TouchableOpacity>

      <FlatList
        data={allCollections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CollectionRow item={item} />}
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

      <FloatingActionMenu />

      <FilterSortModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        stats={stats}
        selectedGroup={selectedGroupName}
        onGroupChange={handleGroupNameChange}
        // Truyền thêm các state status & sort vào đây
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
  loadMoreButton: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  loadMoreText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
