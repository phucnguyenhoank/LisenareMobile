import { request } from "@/services/client";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { PAGINATION_LIMIT } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import type { Collection } from "@/types/collection";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "@/components/Button";
import { BrickLessonPage, BrickPage } from "@/types/brick";
import BrickRowItem from "@/features/pending-bricks/BrickRowItem";
import FilterSortModal from "@/features/pending-bricks/FilterSortModal";
import {
  BrickSort,
  BrickStatusFilter,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "@/constants/bricks";
import BrickFilterBar from "@/features/pending-bricks/BrickFilterBar";
import { handleRequestError } from "@/utils/handle-request-error";
import { hideDialog, showDialog } from "@/utils/dialogs";
import { toast } from "@/utils/toasts";
import { SYSTEM_LEVELS } from "@/constants/collections";
import LessonRowItem from "@/features/pending-bricks/LessonRowItem";

export default function PendingBricksScreen() {
  const { token, isTokenLoading } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

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
  const [selectedStatus, setSelectedStatus] = useState<BrickStatusFilter>(null);
  const [selectedSort, setSelectedSort] = useState<BrickSort>("RECOMMENDED");

  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId,
  );

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const isSystemCollection =
    selectedCollection != null &&
    SYSTEM_LEVELS.some((level) => level.name === selectedCollection.name);

  useEffect(() => {
    setSelectedLessonId(null);
  }, [selectedCollectionId]);

  const {
    data: lessonsData,
    fetchNextPage: fetchNextLessonsPage,
    hasNextPage: hasNextLessonsPage,
    isLoading: isLessonsLoading,
    isFetchingNextPage: isFetchingNextLessonsPage,
    refetch: refetchLessons,
  } = useInfiniteQuery({
    queryKey: ["pending-lessons", selectedCollectionId, selectedStatus],
    queryFn: async ({ pageParam }) => {
      if (selectedCollectionId === null) {
        return { items: [], total: 0 };
      }

      const params = new URLSearchParams({
        collection_id: selectedCollectionId.toString(),
        page: pageParam.toString(),
        limit: PAGINATION_LIMIT.toString(),
      });

      if (selectedStatus) {
        params.append("status", selectedStatus);
      }

      return request<BrickLessonPage>(
        `/bricks/pending/lessons?${params.toString()}`,
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoadedSoFar = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0,
      );

      return totalLoadedSoFar < lastPage.total
        ? allPages.length + 1
        : undefined;
    },
    enabled:
      !!token &&
      !!selectedCollectionId &&
      isSystemCollection &&
      selectedLessonId === null,
  });

  useEffect(() => {
    if (collections.length > 0) {
      // If there are collections and none are selected (or the old selection is gone), pick the first one
      if (
        selectedCollectionId === null ||
        !collections.some((c) => c.id === selectedCollectionId)
      ) {
        setSelectedCollectionId(collections[0].id);
      }
    } else {
      // Clear out the selection if everything was deleted on the other screen
      setSelectedCollectionId(null);
    }
  }, [collections, selectedCollectionId]);

  const {
    data: bricksData,
    fetchNextPage,
    hasNextPage,
    isLoading: isBricksLoading,
    isFetchingNextPage,
    refetch: refetchBricks,
  } = useInfiniteQuery({
    queryKey: [
      "pending-bricks",
      selectedCollectionId,
      selectedStatus,
      selectedSort,
      selectedLessonId,
    ],
    queryFn: async ({ pageParam }) => {
      if (selectedCollectionId === null) {
        return { items: [], total: 0 };
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

      if (isSystemCollection && selectedLessonId !== null) {
        params.append("lesson_id", selectedLessonId.toString());
      }

      return request<BrickPage>(`/bricks/pending?${params.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoadedSoFar = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0,
      );

      return totalLoadedSoFar < lastPage.total
        ? allPages.length + 1
        : undefined;
    },
    enabled:
      !!token &&
      !!selectedCollectionId &&
      (!isSystemCollection || selectedLessonId !== null),
  });

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetchCollections();
        refetchBricks();
      }
    }, [token, refetchCollections, refetchBricks]),
  );

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

  const showLessons = isSystemCollection && selectedLessonId === null;

  const lessonItems = lessonsData?.pages.flatMap((page) => page.items) ?? [];
  const brickItems = bricksData?.pages.flatMap((page) => page.items) ?? [];

  const totalCount = showLessons
    ? (lessonsData?.pages[0]?.total ?? 0)
    : (bricksData?.pages[0]?.total ?? 0);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchCollections(),
        refetchBricks(),
        refetchLessons(),
      ]);
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
      toast.success("Brick deleted successfully");
    } catch (err: any) {
      handleRequestError(err);
    }
  };

  const handleDeleteBrick = (brickId: number) => {
    showDialog({
      title: "Delete Brick Permanently?",
      message:
        "This action CANNOT BE UNDONE. This brick and all \
        associated progress, history, and analytics will be DESTROYED FOREVER.",
      children: (
        <View style={{ gap: 12, marginTop: 10 }}>
          <Button
            title="Cancel, Keep It"
            variant="outline"
            onPress={() => hideDialog()}
          />

          <Button
            title="Yes, Delete Permanently"
            onPress={() => {
              performDelete(brickId);
              hideDialog();
            }}
            style={{
              backgroundColor: colors.important,
              borderColor: colors.important,
            }}
            textStyle={{
              color: colors.surface,
              fontWeight: "900",
            }}
          />
        </View>
      ),
    });
  };

  return (
    <View style={styles.container}>
      {collections.length > 0 && (
        <BrickFilterBar
          totalBricks={totalCount}
          selectedCollection={selectedCollection || null}
          selectedStatus={selectedStatus || ""}
          selectedSort={selectedSort}
          STATUS_OPTIONS={STATUS_OPTIONS}
          SORT_OPTIONS={SORT_OPTIONS}
          setIsModalVisible={setIsModalVisible}
        />
      )}

      <FlatList
        // Cast to any[] to stop TypeScript from complaining about the mixed types
        data={(showLessons ? lessonItems : brickItems) as any[]}
        keyExtractor={(item) =>
          showLessons ? item.lesson_id.toString() : item.id.toString()
        }
        renderItem={({ item }) =>
          showLessons ? (
            <LessonRowItem
              lesson={item}
              onPress={() => setSelectedLessonId(item.lesson_id)}
            />
          ) : (
            <BrickRowItem
              brick={item}
              onLearn={handleLearnBrick}
              onEdit={handleEditBrick}
              onDelete={handleDeleteBrick}
            />
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={colors.secondary}
            />
            <Text style={styles.emptyText}>Danh sách trống</Text>
          </View>
        }
        onEndReached={() => {
          if (showLessons) {
            if (hasNextLessonsPage && !isFetchingNextLessonsPage) {
              fetchNextLessonsPage();
            }
          } else {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          showLessons ? (
            isFetchingNextLessonsPage ? (
              <ActivityIndicator
                style={{ marginVertical: 20 }}
                color={colors.primary}
              />
            ) : (
              <View style={{ height: 100 }} />
            )
          ) : isFetchingNextPage ? (
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
          visible={isModalVisible}
          showSortBy={!showLessons}
          onClose={() => setIsModalVisible(false)}
          collections={collections}
          selectedCollectionId={selectedCollectionId}
          selectedStatus={selectedStatus}
          selectedSort={selectedSort}
          onCollectionChange={setSelectedCollectionId}
          onStatusChange={setSelectedStatus}
          onSortChange={setSelectedSort}
        />
      )}
      <FloatingActionMenu />

      {/* Elegant Bottom-Left Floating Back Control */}
      {showLessons === false && isSystemCollection && (
        <TouchableOpacity
          style={[
            styles.floatingBackButton,
            { backgroundColor: colors.secondary },
          ]}
          onPress={() => setSelectedLessonId(null)}
        >
          <EvilIcons
            name="chevron-left"
            size={32}
            color="#FFF"
            style={styles.backIcon}
          />
          <Text style={styles.backButtonText}>Lessons</Text>
        </TouchableOpacity>
      )}
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
    marginTop: 10,
    fontSize: 16,
    color: "#444",
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
  floatingBackButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    paddingLeft: 6,
    paddingRight: 16,
    borderRadius: 21,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backIcon: {
    marginRight: -2,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
