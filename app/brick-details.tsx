import { request } from "@/api/client";
import colors from "@/theme/colors";
import { Brick } from "@/types/brick";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BrickDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // TanStack Query replaces useEffect and useState
  const {
    data: brick,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brick", id],
    queryFn: () => request<Brick>(`/bricks/by-id/${id}`),
    enabled: !!id, // Only run the query if id exists
  });

  if (isLoading) return <ActivityIndicator style={styles.center} />;

  if (error || !brick) {
    return (
      <View style={styles.center}>
        <Text>Brick not found or an error occurred.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View style={styles.content}>
        <Text style={styles.label}>Target Text (English)</Text>
        <Text style={styles.quote}>{brick.target_text}</Text>

        <Text style={styles.label}>Native Text (Vietnamese)</Text>
        <Text style={styles.nativeText}>{brick.native_text}</Text>

        {brick.cefr_level && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Level: {brick.cefr_level}</Text>
          </View>
        )}

        <View style={styles.metaSection}>
          <Text style={styles.metaLabel}>Brick ID: {id}</Text>
          <Text style={styles.metaLabel}>
            Audio Path: {brick.target_audio_path}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 20 },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  quote: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  nativeText: { fontSize: 18, color: "#444", marginBottom: 20 },
  badge: {
    backgroundColor: colors.buttonBackground,
    padding: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: { color: colors.secondary, fontWeight: "bold" },
  metaSection: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },
  metaLabel: { fontSize: 12, color: "#999", marginTop: 4 },
});
