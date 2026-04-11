import { request } from "@/api/client";
import FeedItem from "@/components/discovery/FeedItem";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { useAuth } from "@/context/AuthContext";
import { Post, PostPage } from "@/types/post";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DiscoveryScreen() {
  const { token } = useAuth();
  const [feed, setFeed] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPosts = async (pageNumber: number, refresh = false) => {
    if (loading) return;

    setLoading(true);

    try {
      let data;

      if (token) {
        data = await request<PostPage>(`/posts/recommended`);
      } else {
        data = await request<PostPage>(`/posts/random`);
      }

      setFeed((prev) => (refresh ? data.items : [...prev, ...data.items]));
      setPage(pageNumber);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handleLoadMore = () => {
    fetchPosts(page + 1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts(1, true);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={feed}
        renderItem={({ item }) => <FeedItem item={item} />}
        keyExtractor={(item) => String(item.id)}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListFooterComponent={
          <View style={{ padding: 20, alignItems: "center" }}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                onPress={handleLoadMore}
                style={styles.loadMoreButton}
              >
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <FloatingActionMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  loadMoreButton: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  loadMoreText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
