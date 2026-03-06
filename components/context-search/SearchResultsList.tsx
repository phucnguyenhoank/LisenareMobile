import spacing from "@/theme/spacing";
import {
  BrickContextSearchResult,
  ContextSearchResult,
  VideoContextSearchResult,
} from "@/types/context-search";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
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

type Props = {
  mode: string;
  results: ContextSearchResult[];
  loading: boolean;
  query: string;
  onScroll: any;
};

export default function SearchResultsList({
  mode,
  results,
  loading,
  query,
  onScroll,
}: Props) {
  if (loading) return null;

  if (!results.length) {
    return <EmptyState query={query} label={mode} />;
  }

  return (
    <Animated.FlatList // 1. Must use Animated version
      data={results}
      onScroll={onScroll} // 2. Use the prop from parent
      scrollEventThrottle={16} // 3. Updates at 60fps
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={styles.listContent} // 4. Add padding for header
      renderItem={({ item }) =>
        mode === "videos" ? (
          <VideoCard item={item as VideoContextSearchResult} />
        ) : (
          <BrickCard item={item as BrickContextSearchResult} />
        )
      }
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
    paddingTop: 110, // Matches your header height (SearchBar + Tabs)
    paddingBottom: 20,
  },
});
