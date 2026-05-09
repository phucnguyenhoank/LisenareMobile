import { request } from "@/api/client";
import FeedItem from "@/components/discovery/FeedItem";
import { useSession } from "@/context/SessionContext";
import { useAttentionTracking } from "@/hooks/useAttentionTracking";
import colors from "@/theme/colors";
import { SnippetPage } from "@/types/snippet";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BackHandler } from "react-native";

export default function DiscoveryScreen() {
  const { sessionId } = useSession();
  console.log("Tracking action in session:", sessionId);

  const { onViewableItemsChanged, viewabilityConfig } = useAttentionTracking({
    sessionId,
    mode: "snippets",
  });

  const flatListRef = useRef<FlatList<any>>(null);
  const scrollOffset = useRef(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["discovery-snippets"],
    queryFn: async ({ pageParam }) => {
      const data = await request<SnippetPage>(
        `/snippets/recommended/${sessionId}`,
      );
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // allowing "Next Page" if the backend keeps still have items
      return lastPage.items.length > 0 ? allPages.length + 1 : undefined;
    },
    // Flatten all items into a single array
    select: (data) => {
      const allItems = data.pages.flatMap((page) => page.items);

      // --- deduplication ---
      const seenIds = new Set();
      const uniqueItems = allItems.filter((item) => {
        if (seenIds.has(item.id)) {
          return false;
        }
        seenIds.add(item.id);
        return true;
      });

      return {
        pages: data.pages,
        pageParams: data.pageParams,
        items: uniqueItems,
      };
    },
  });

  const allSnippets = data?.items ?? [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    const backAction = () => {
      // If user is scrolled down, scroll to top and refresh
      if (scrollOffset.current > 10) {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        refetch();
        return true; // Stop the app from quitting
      }

      // If already at top, return false to let the app quit
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    // Clean up the listener when the screen is unmounted
    return () => backHandler.remove();
  }, [refetch]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={allSnippets}
        renderItem={({ item }) => <FeedItem item={item} />}
        keyExtractor={(item) => String(item.id)}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // 0.5 = 50% from bottom
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={colors.secondary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            // State 1: Still loading the very first page
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.secondary} />
            </View>
          ) : (
            // State 2: Done loading, but items array is empty
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>Oops! Trống trơn.</Text>
              <Text style={styles.emptySubtitle}>
                Hãy thử làm mới trang hoặc quay lại sau.
              </Text>
            </View>
          )
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={(event) => {
          scrollOffset.current = event.nativeEvent.contentOffset.y;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
