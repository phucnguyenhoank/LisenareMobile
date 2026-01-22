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

interface ContextSearchResult {
  ytb_video_id: string;
  text: string;
  start: number;
  duration: number;
}

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContextSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Using your provided apiCall function
      // It will automatically set Content-Type: application/json
      // and inject the Bearer token from authStorage
      const data = await apiCall<ContextSearchResult[]>("/context-search", {
        method: "POST",
        body: { query: query },
        requiresAuth: true, // Set to false if this endpoint is public
      });

      setResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      // You can implement a toast or alert here
    } finally {
      setLoading(false);
    }
  };

  const renderVideoItem = ({ item }: { item: ContextSearchResult }) => (
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

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.ytb_video_id}-${index}`}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {query
                  ? "No contexts found for this phrase."
                  : "Enter a phrase to see how it's used in real videos."}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", paddingTop: 20 },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
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
  buttonDisabled: { backgroundColor: "#A2CFFE" },
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
  badgeText: { color: "#007AFF", fontSize: 12, fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
    lineHeight: 22,
  },
});
