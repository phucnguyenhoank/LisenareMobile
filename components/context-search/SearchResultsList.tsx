import spacing from "@/theme/spacing";
import {
  BrickContextSearchResult,
  ContextSearchResult,
  VideoContextSearchResult,
} from "@/types/context-search";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
};

export default function SearchResultsList({
  mode,
  results,
  loading,
  query,
}: Props) {
  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={results}
      keyExtractor={(_, i) => i.toString()}
      // If no results, show EmptyState as part of the list
      ListEmptyComponent={<EmptyState query={query} label={mode} />}
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
    paddingTop: 110,
    paddingBottom: 20,
  },
});
