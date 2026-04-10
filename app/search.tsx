import { request } from "@/api/client"; // Adjust path to your file structure
import ModeTabs from "@/components/context-search/ModeTabs";
import SearchBar from "@/components/context-search/SearchBar";
import SearchResultsList from "@/components/context-search/SearchResultsList";
import { ContextSearchResult, SearchMode } from "@/types/context-search";
import React, { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("videos");
  const [results, setResults] = useState<ContextSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const endpoint =
        mode === "videos" ? "/context-search/videos" : "/context-search/bricks";

      const data = await request<ContextSearchResult[]>(endpoint, {
        method: "POST",
        body: { query: q },
      });

      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />
        <ModeTabs
          mode={mode}
          setMode={(m) => {
            setMode(m);
            if (query.trim()) handleSearch();
          }}
        />
      </View>

      <SearchResultsList
        mode={mode}
        results={results}
        loading={loading}
        query={query}
      />
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
