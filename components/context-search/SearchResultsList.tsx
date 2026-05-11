import { useSession } from "@/context/SessionContext";
import { useAttentionTracking } from "@/hooks/useAttentionTracking";
import spacing from "@/theme/spacing";
import {
  BrickContextSearchResult,
  VideoContextSearchResult
} from "@/types/context-search";
import { Snippet } from "@/types/snippet";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FeedItem from "../discovery/FeedItem";
import BrickCard from "./BrickCard";
import VideoCard from "./VideoCard";

function EmptyState({ query, label }: { query: string; label: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {query
          ? `No ${label} found for this phrase.`
          : "Enter a phrase to search."}
      </Text>
    </View>
  );
}

type Props =
  | {
      mode: "snippets";
      results: Snippet[];
      loading: boolean;
      query: string;
    }
  | {
      mode: "videos";
      results: VideoContextSearchResult[];
      loading: boolean;
      query: string;
    }
  | {
      mode: "bricks";
      results: BrickContextSearchResult[];
      loading: boolean;
      query: string;
    };

export default function SearchResultsList({
  mode,
  results,
  loading,
  query,
}: Props) {
  const { sessionId } = useSession();

  const { onViewableItemsChanged, viewabilityConfig } = useAttentionTracking({
    sessionId,
    mode,
  });

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={results}
      keyExtractor={(_, i) => i.toString()}
      ListEmptyComponent={<EmptyState query={query} label={mode} />}
      renderItem={({ item }) => {
        switch (mode) {
          case "snippets":
            return <FeedItem item={item} />;

          case "videos":
            return <VideoCard item={item} />;

          case "bricks":
            return <BrickCard item={item} />;
        }
      }}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
  },

  listContent: {
    paddingTop: 110,
    paddingBottom: 20,
  },
});
