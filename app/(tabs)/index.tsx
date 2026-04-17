import { request } from "@/api/client";
import FeedItem from "@/components/discovery/FeedItem";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { Snippet, SnippetPage } from "@/types/snippet";
import { InteractionType, logInteraction } from "@/utils/log-interaction";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";

function getAttentionItem(viewableItems: ViewToken[]) {
  if (viewableItems.length === 0) return null;

  // sort by index (important!)
  const sorted = [...viewableItems].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );

  // Exception: if first item in list is visible
  if (sorted[0]?.index === 0) {
    return (sorted[0].item as Snippet).id;
  }

  // default: pick middle
  const middleIndex = Math.floor(sorted.length / 2);

  return (sorted[middleIndex]?.item as Snippet)?.id ?? null;
}

export default function DiscoveryScreen() {
  const { sessionId } = useSession();
  console.log("Tracking action in session:", sessionId);

  const { token } = useAuth();

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 100,
  };

  // approximate the middle item user are paying attention to
  // store what item_id and the time it appeared in the screen
  const currentItemRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // record the time an item appears
  // calculate the duration when it leaves
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // viewableItems is a list of items currently visible on the screen
      // Example of the list of 1 item:
      /*
      [
        {
          "index": 3,
          "item": {
            "id": 376,
            "content": "he came to understand its dodges and tricks and to accept it as it was",
            "audio_path": "common-voice/cv-valid-test/cv-valid-test/sample-000375.mp3",
            "created_at": "2026-04-17T02:51:48.265054",
            "translation": null,
            "creator": {
              "id": 1,
              "full_name": "The Avid Learner"
            }
          },
          "key": "376",
          "isViewable": true
        }
      ]
      */
      const now = Date.now();

      const newAttentionItemId = getAttentionItem(viewableItems);

      if (newAttentionItemId !== currentItemRef.current) {
        // Send the TIME_SPENT to the log if the current item exists
        if (currentItemRef.current !== null) {
          const duration = (now - startTimeRef.current) / 1000;

          console.log("TIME_SPENT:", currentItemRef.current, duration);

          if (duration > 0.4) {
            logInteraction({
              sessionId,
              snippetId: currentItemRef.current,
              type: InteractionType.TIME_SPENT,
              duration,
            });
          }
        }

        // ENTER new item user are paying attention to
        currentItemRef.current = newAttentionItemId;
        startTimeRef.current = now;
      }
    },
  ).current;

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
      const data = await request<SnippetPage>(`/snippets/random`);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length + 1;
    },
    // Flatten all items into a single array
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      items: data.pages.flatMap((page) => page.items),
    }),
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
