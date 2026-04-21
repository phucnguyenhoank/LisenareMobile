import { request } from "@/api/client"; // Adjust path to your file structure
import ModeTabs from "@/components/context-search/ModeTabs";
import SearchBar from "@/components/context-search/SearchBar";
import SearchResultsList from "@/components/context-search/SearchResultsList";
import {
  BrickContextSearchResult,
  SearchMode,
  VideoContextSearchResult,
} from "@/types/context-search";
import { Snippet } from "@/types/snippet";
import React, { useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SearchResultMap = {
  snippets: Snippet[];
  videos: VideoContextSearchResult[];
  bricks: BrickContextSearchResult[];
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("snippets");

  const [resultsMap, setResultsMap] = useState<SearchResultMap>({
    snippets: [],
    videos: [],
    bricks: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const endpoint = `/context-search/${mode}-search`;

      const data = await request<SearchResultMap[typeof mode]>(endpoint, {
        method: "POST",
        body: { query: q },
      });

      setResultsMap((prev) => ({
        ...prev,
        [mode]: data || [],
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [mode]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />
        <ModeTabs mode={mode} setMode={(m) => setMode(m)} />
      </View>

      <SearchResultsList
        mode={mode}
        results={resultsMap[mode] as any}
        loading={loading}
        query={query}
      />
      <View style={{ paddingBottom: insets.bottom }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: { backgroundColor: "#FAFAFA" },
});
