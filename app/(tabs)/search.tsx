import { apiCall } from "@/api/client"; // Adjust path to your file structure
import colors from "@/theme/colors";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

interface VideoContextSearchResult {
  ytb_video_id: string;
  text: string;
  start: number;
  duration: number;
}

interface BrickContextSearchResult {
  native_text: string;
  target_text: string;
  target_audio_uri: string;
  cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  is_public: boolean;
}

type SearchMode = "videos" | "bricks";

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

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [videoResults, setVideoResults] = useState<VideoContextSearchResult[]>(
    [],
  );
  const [brickResults, setBrickResults] = useState<BrickContextSearchResult[]>(
    [],
  );
  const [mode, setMode] = useState<SearchMode>("videos");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      if (mode === "videos") {
        const data = await apiCall<VideoContextSearchResult[]>(
          "/context-search/videos",
          { method: "POST", body: { query } },
        );
        setVideoResults(data || []);
      } else {
        const data = await apiCall<BrickContextSearchResult[]>(
          "/context-search/bricks",
          { method: "POST", body: { query } },
        );
        setBrickResults(data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderVideoItem = ({ item }: { item: VideoContextSearchResult }) => (
    <View style={styles.card}>
      <YoutubePlayer
        height={210}
        videoId={item.ytb_video_id}
        initialPlayerParams={{
          start: Math.floor(item.start),
          rel: false,
          modestbranding: true,
        }}
      />
      <View style={styles.info}>
        <Text style={styles.quote}>{item.text}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            Starts at {Math.floor(item.start)}s
          </Text>
        </View>
      </View>
    </View>
  );

  const renderBrickItem = ({ item }: { item: BrickContextSearchResult }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.quote}>{item.target_text}</Text>
        <Text style={{ color: "#666", marginTop: 6 }}>{item.native_text}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.cefr_level}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search English phrases..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[styles.button, !query.trim() && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(["videos", "bricks"] as SearchMode[]).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => {
              setMode(item);
              if (query.trim()) handleSearch();
            }}
            style={[styles.tab, mode === item && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, mode === item && styles.tabTextActive]}
            >
              {item === "videos" ? "Videos" : "Bricks"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {mode === "videos" ? (
        <FlatList<VideoContextSearchResult>
          data={videoResults}
          keyExtractor={(item, index) => `${item.ytb_video_id}-${index}`}
          renderItem={renderVideoItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? <EmptyState query={query} label="videos" /> : null
          }
        />
      ) : (
        <FlatList<BrickContextSearchResult>
          data={brickResults}
          keyExtractor={(_, index) => `brick-${index}`}
          renderItem={renderBrickItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? <EmptyState query={query} label="bricks" /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  searchContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#888" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  listContent: { paddingVertical: 10 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  info: { padding: 16 },
  quote: { fontSize: 17, fontWeight: "500", color: "#1A1A1A", lineHeight: 24 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeText: { color: colors.secondary, fontSize: 12, fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
    lineHeight: 22,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: colors.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  tabTextActive: {
    color: "#fff",
  },
});
