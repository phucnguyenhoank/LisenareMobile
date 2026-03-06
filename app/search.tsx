import { request } from "@/api/client"; // Adjust path to your file structure
import ModeTabs from "@/components/context-search/ModeTabs";
import SearchBar from "@/components/context-search/SearchBar";
import SearchResultsList from "@/components/context-search/SearchResultsList";
import { ContextSearchResult, SearchMode } from "@/types/context-search";
import React, { useRef, useState } from "react";
import { Animated, Keyboard, StyleSheet, View } from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("videos");
  const [results, setResults] = useState<ContextSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100], // Adjust 100 based on the header height
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

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
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
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
      </Animated.View>

      <SearchResultsList
        mode={mode}
        results={results}
        loading={loading}
        query={query}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#FAFAFA",
  },
});
