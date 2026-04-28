import { request } from "@/api/client";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import colors from "@/theme/colors";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ListeningPracticeScreen() {
  const insets = useSafeAreaInsets();

  // ===== STATE =====
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(true);

  const [audioList, setAudioList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [isFetching, setIsFetching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [groups, setGroups] = useState<string[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // ===== AUDIO =====
  const currentRemoteUri =
    audioList.length > 0 ? audioList[currentIndex] : null;

  const { audioPath, isAudioLoading } = useCachedAudio(currentRemoteUri);

  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);
  const status = useAudioPlayerStatus(player);

  const isSessionActive = audioList.length > 0;
  const isPlayingNow = status?.playing ?? false;

  // ===== AUTO NEXT =====
  useEffect(() => {
    if (status?.didJustFinish && isPlaying) {
      if (currentIndex < audioList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // End of list → pause (không reset)
        setIsPlaying(false);
      }
    }
  }, [status?.didJustFinish]);

  // ===== AUTO PLAY WHEN READY =====
  useEffect(() => {
    if (audioPath && isPlaying) {
      player.play();
    }
  }, [audioPath, currentIndex, isPlaying]);

  // ===== HANDLERS =====

  const handleFetchAndStart = async () => {
    setIsFetching(true);
    try {
      const params = isAllSelected
        ? ""
        : "?" +
          selectedGroups
            .map((g) => `group_names=${encodeURIComponent(g)}`)
            .join("&");

      const data = await request<string[]>(`/bricks/audio${params}`);

      if (data && data.length > 0) {
        setAudioList(data);
        setCurrentIndex(0);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Failed to load audios", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePlayPause = async () => {
    // Chưa có session → fetch
    if (!isSessionActive) {
      await handleFetchAndStart();
      return;
    }

    // Toggle play / pause
    if (isPlayingNow) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!isSessionActive) return;
    if (currentIndex < audioList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isSessionActive) return;
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      // nếu đang ở đầu → replay lại câu hiện tại
      player.seekTo(0);
      player.play();
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const data = await request<string[]>("/collections/pending-groups");
        setGroups(data || []);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  // ===== UI =====

  const showLoading = isFetching || (isSessionActive && isAudioLoading);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Listening Practice</Text>
      <Text style={styles.subtitle}>Choose what you want to listen to</Text>

      {/* GROUP SELECTOR */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Groups</Text>

        {isLoadingGroups ? (
          <ActivityIndicator style={{ marginTop: 10 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupContainer}
          >
            {/* All button */}
            <Pressable
              style={[
                styles.groupChip,
                isAllSelected && styles.groupChipActive,
              ]}
              onPress={() => {
                setIsAllSelected(true);
                setSelectedGroups([]);
              }}
            >
              <Text
                style={[
                  styles.groupText,
                  isAllSelected && styles.groupTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>

            {/* Groups */}
            {groups.map((groupName) => {
              const active = selectedGroups.includes(groupName);

              return (
                <Pressable
                  key={groupName}
                  style={[styles.groupChip, active && styles.groupChipActive]}
                  onPress={() => {
                    setIsAllSelected(false);
                    setSelectedGroups((prev) =>
                      prev.includes(groupName)
                        ? prev.filter((g) => g !== groupName)
                        : [...prev, groupName],
                    );
                  }}
                >
                  <Text
                    style={[styles.groupText, active && styles.groupTextActive]}
                  >
                    {groupName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* PLAYER */}
      <View style={styles.playContainer}>
        <View style={styles.controlsRow}>
          {/* PREV */}
          <Pressable
            style={[
              styles.skipButton,
              (!isSessionActive || currentIndex === 0) && styles.disabled,
            ]}
            onPress={handlePrev}
            disabled={!isSessionActive}
          >
            <Feather name="skip-back" size={22} color="#333" />
          </Pressable>

          {/* PLAY / PAUSE */}
          <View style={styles.mainButtonContainer}>
            {showLoading ? (
              <ActivityIndicator size="large" color={colors.secondary} />
            ) : (
              <Pressable style={styles.playButton} onPress={handlePlayPause}>
                <Feather
                  name={isPlayingNow ? "pause" : "play"}
                  size={40}
                  color="white"
                />
              </Pressable>
            )}
          </View>

          {/* NEXT */}
          <Pressable
            style={[
              styles.skipButton,
              (!isSessionActive || currentIndex === audioList.length - 1) &&
                styles.disabled,
            ]}
            onPress={handleNext}
            disabled={!isSessionActive}
          >
            <Feather name="skip-forward" size={22} color="#333" />
          </Pressable>
        </View>

        <Text style={styles.playLabel}>
          {isSessionActive
            ? `Playing ${currentIndex + 1} / ${audioList.length}`
            : "Start Listening"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },

  section: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  groupContainer: {
    flexDirection: "row",
    gap: 10,
  },

  groupChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },

  groupChipActive: {
    backgroundColor: colors.secondary,
  },

  groupText: {
    fontSize: 13,
    color: "#333",
  },

  groupTextActive: {
    color: "white",
    fontWeight: "600",
  },

  playContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },

  skipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },

  disabled: {
    opacity: 0.3,
  },

  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  mainButtonContainer: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },

  playLabel: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});
