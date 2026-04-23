import { request } from "@/api/client";
import FeedItem from "@/components/discovery/FeedItem";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { useAttentionTracking } from "@/hooks/useAttentionTracking";
import { SnippetPage } from "@/types/snippet";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function DiscoveryScreen() {
  const { sessionId } = useSession();
  console.log("Tracking action in session:", sessionId);

  const { onViewableItemsChanged, viewabilityConfig } = useAttentionTracking({
    sessionId,
    mode: "snippets",
  });

  const { token } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["discovery-snippets", token], // token included so it refetches if auth changes
    queryFn: async ({ pageParam }) => {
      const data = await request<SnippetPage>(`/snippets/recommended/${sessionId}`);
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

  return (
    <View style={styles.container}>
      <FlatList
        data={allSnippets}
        renderItem={({ item }) => <FeedItem item={item} />}
        keyExtractor={(item) => String(item.id)}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // 0.5 = 50% from bottom
        ListEmptyComponent={
          isLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          ) : null
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <FloatingActionMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
});
