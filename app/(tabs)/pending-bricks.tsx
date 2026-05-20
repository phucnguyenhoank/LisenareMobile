import { request } from "@/services/client";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { PAGINATION_LIMIT } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import type { Collection } from "@/types/collection";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "@/components/Button";
import { Brick } from "@/types/brick";
import BrickRowItem from "@/features/pending-bricks/BrickRowItem";
import FilterSortModal from "@/features/pending-bricks/FilterSortModal";
import {
  BrickSort,
  BrickStatusFilter,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "@/constants/bricks";
import { Toast } from "@/components/Toast";
import BrickFilterBar from "@/features/pending-bricks/BrickFilterBar";

export default function PendingCollectionsScreen() {
  const router = useRouter();
  const { token, isTokenLoading } = useAuth();
  const [isFilterSortModelVisible, seIsFilterSortModelVisible] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    data: collections = [],
    isLoading: isCollectionsLoading,
    refetch: refetchCollections,
  } = useQuery<Collection[]>({
    queryKey: ["pendingCollections"],
    queryFn: () => request<Collection[]>("/collections/pending"),
    enabled: !!token,
  });

  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId,
  );
  const [selectedStatus, setSelectedStatus] = useState<BrickStatusFilter>(null);
  const [selectedSort, setSelectedSort] = useState<BrickSort>("RECOMMENDED");

  // Auto-select the first collection once loaded
  useEffect(() => {
    if (collections.length > 0 && selectedCollectionId === null) {
      setSelectedCollectionId(collections[0].id);
    }
  }, [collections]);

  const {
    data: bricksData,
    fetchNextPage,
    hasNextPage,
    isLoading: isBricksLoading,
    isFetchingNextPage,
    refetch: refetchBricks,
  } = useInfiniteQuery({
    queryKey: ["bricks", selectedCollectionId, selectedStatus, selectedSort],
    queryFn: async ({ pageParam }) => {
      if (selectedCollectionId === null) {
        return [];
      }

      const params = new URLSearchParams({
        collection_id: selectedCollectionId.toString(),
        page: pageParam.toString(),
        limit: PAGINATION_LIMIT.toString(),
        sort_by: selectedSort,
      });

      if (selectedStatus) {
        params.append("status", selectedStatus);
      }

      return request<Brick[]>(`/bricks/pending?${params.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGINATION_LIMIT
        ? allPages.length + 1
        : undefined;
    },
    enabled: !!token,
  });

  if (isTokenLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>Đang tải thông tin cá nhân</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.centered}>
        <Button
          title="Đăng nhập"
          onPress={() => router.push("/setting")}
          style={{ alignSelf: "center" }}
        />
        <Text style={styles.subtitle}>để xem bộ sưu tập</Text>
      </View>
    );
  }

  if (isCollectionsLoading || isBricksLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>Đang tải bricks</Text>
      </View>
    );
  }

  const allBricks = bricksData?.pages.flat() ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCollections(), refetchBricks()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLearnBrick = (brickId: number) => {
    router.push({
      pathname: "/learn-brick",
      params: { brick_id: brickId },
    });
  };

  const handleEditBrick = (brickId: number) => {
    router.push({
      pathname: "/edit-brick",
      params: { brick_id: brickId },
    });
  };

  const performDelete = async (brickId: number) => {
    try {
      await request(`/bricks/${brickId}`, {
        method: "DELETE",
      });
      setToast("Brick deleted successfully");
    } catch (err: any) {
      Alert.alert("Không thể xóa", err.message);
      console.log(err);
    }
  };

  const handleDeleteBrick = (brickId: number) => {
    Alert.alert(
      "Bạn có chắc muốn xóa Brick này?",
      "Xóa brick KHÔNG THỂ HOÀN TÁC và tất cả tương tác với brick này sẽ MẤT VĨNH VIỄN.",
      [
        { text: "Thoát", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => performDelete(brickId),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <BrickFilterBar
        selectedCollection={selectedCollection || null}
        selectedStatus={selectedStatus || ""}
        selectedSort={selectedSort}
        STATUS_OPTIONS={STATUS_OPTIONS}
        SORT_OPTIONS={SORT_OPTIONS}
        seIsFilterSortModelVisible={seIsFilterSortModelVisible}
      />

      <FlatList
        data={allBricks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BrickRowItem
            brick={item}
            onLearn={handleLearnBrick}
            onEdit={handleEditBrick}
            onDelete={handleDeleteBrick}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không thấy bài học nào.</Text>
          </View>
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              color={colors.primary}
            />
          ) : (
            <View style={{ height: 100 }} />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {selectedCollectionId && (
        <FilterSortModal
          visible={isFilterSortModelVisible}
          onClose={() => seIsFilterSortModelVisible(false)}
          collections={collections}
          selectedCollectionId={selectedCollectionId}
          selectedStatus={selectedStatus}
          selectedSort={selectedSort}
          onCollectionChange={setSelectedCollectionId}
          onStatusChange={setSelectedStatus}
          onSortChange={setSelectedSort}
        />
      )}

      {toast && (
        <View style={styles.toastWrapper}>
          <Toast
            message={toast}
            onClose={() => setToast(null)}
            duration={3000}
          />
        </View>
      )}

      <FloatingActionMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#999",
    marginTop: 12,
    fontSize: 16,
  },
  toastWrapper: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "box-none",
  },
});
