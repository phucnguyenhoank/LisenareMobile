import { request } from "@/services/client";
import colors from "@/theme/colors";
import { Brick } from "@/types/brick";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons"; // Assuming Expo
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioPlayer } from "expo-audio";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import { useEffect } from "react";
import { StatusResponse } from "@/types/api";

export default function BrickDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: brick,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brick", id],
    queryFn: () => request<Brick>(`/bricks/by-id/${id}`),
    enabled: !!id,
  });

  const { audioPath, isAudioLoading } = useCachedAudio(
    brick?.target_audio_path ?? null,
  );

  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);

  useEffect(() => {
    if (audioPath) player.replace({ uri: audioPath });
  }, [audioPath]);

  const handlePlayAudio = () => {
    if (!audioPath) return;
    player.seekTo(0);
    player.play();
  };

  const handleSaveOverride = async () => {
    if (!brick) {
      Alert.alert("Error", "Brick not found.");
      return;
    }
    try {
      const response = await request<StatusResponse>(
        `/bricks/override/${brick.id}`,
        {
          method: "POST",
        },
      );

      if (response.status === "success") {
        Alert.alert("Saved!", "This brick has been saved to your collection.");
      }
    } catch (error) {
      console.error("Failed to save override:", error);
      Alert.alert("Error", "Could not save the brick. Please try again.");
    }
  };

  if (isLoading)
    return <ActivityIndicator style={styles.center} color={colors.primary} />;

  if (error || !brick) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Brick not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveOverrideBtn}
          onPress={handleSaveOverride}
        >
          <Feather name="copy" size={20} color={colors.primary} />
          <Text style={styles.saveOverrideText}>Save a copy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>English</Text>
          <Text style={styles.targetText}>{brick.target_text}</Text>
          <TouchableOpacity
            disabled={!audioPath}
            style={[
              styles.audioButton,
              player.playing && styles.audioButtonPlaying,
              !audioPath && { opacity: 0.5 },
            ]}
            onPress={handlePlayAudio}
          >
            {isAudioLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name={player.playing ? "pause" : "volume-high"}
                size={24}
                color={player.playing ? "#fff" : colors.primary}
              />
            )}
            <Text
              style={[
                styles.audioText,
                player.playing && styles.audioTextPlaying,
              ]}
            >
              {isAudioLoading
                ? "Caching..."
                : player.playing
                  ? "Playing..."
                  : "Listen"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vietnamese</Text>
          <Text style={styles.nativeText}>{brick.native_text}</Text>
        </View>
      </View>

      <View style={styles.creatorCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>{brick.creator.full_name[0]}</Text>
        </View>
        <View>
          <Text style={styles.createdByLabel}>Created by</Text>
          <Text style={styles.creatorName}>{brick.creator.full_name}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Brick ID: #{brick.id}</Text>
        <Text style={styles.footerText}>
          Updated: {new Date(brick.last_edit_at).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  section: { marginVertical: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#AAA",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  targetText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.secondary,
    lineHeight: 34,
  },
  nativeText: { fontSize: 20, color: "#4A4A4A", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 20 },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: colors.buttonBackground, // Subtle mint tint
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  audioText: { marginLeft: 6, color: colors.secondary2, fontWeight: "600" },
  audioButtonPlaying: {
    backgroundColor: colors.secondary2,
  },
  audioTextPlaying: {
    color: "#fff",
  },
  saveOverrideBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveOverrideText: {
    marginLeft: 6,
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  creatorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLetter: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  createdByLabel: { fontSize: 12, color: "#888" },
  creatorName: { fontSize: 16, fontWeight: "600", color: colors.primary }, // Focus: Dark Forest
  footer: { marginTop: 30, alignItems: "center", opacity: 0.5 },
  footerText: { fontSize: 11, color: "#666", marginBottom: 4 },
  errorText: { color: colors.important, fontSize: 16 },
});
