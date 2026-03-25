import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCachedAudio } from "@/hooks/useCachedAudio";
import colors from "@/theme/colors";
import { Post } from "@/types/post";
import { useAudioPlayer } from "expo-audio";
import Word from "./Word";

interface FeedItemProps {
  item: Post;
}

export default function FeedItem({ item }: FeedItemProps) {
  const [showFullTranslation, setShowFullTranslation] = useState(false);
  const [hideSubtitle, setHideSubtitle] = useState(true);
  const { audioPath, isAudioLoading } = useCachedAudio(item.audio_uri);
  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);

  const playPostAudio = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${item.creator.full_name}`,
          }}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.author}>{item.creator.full_name}</Text>
          <Text style={styles.timestamp}>{item.created_at}</Text>
        </View>
      </View>

      {isAudioLoading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity onPress={playPostAudio} style={styles.audioButton}>
          <Ionicons name="play-circle" size={32} color={colors.secondary} />
          <Text style={styles.audioText}>Listen</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        {item.content.split(" ").map((word, index) => (
          <Word key={index} word={word} blur={hideSubtitle} />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => setShowFullTranslation(!showFullTranslation)}
        >
          <Text style={styles.actionText}>
            {showFullTranslation ? "Hide Translation" : "View Translation"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setHideSubtitle(!hideSubtitle)}>
          <Text style={styles.actionText}>
            {hideSubtitle ? "Show Subtitle" : "Hide Subtitle"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveIcon}>
          <FontAwesome6 name="add" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {showFullTranslation && (
        <View style={styles.translationBox}>
          <Text style={styles.translationText}>{item.translation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 8,
    padding: 16,
    borderRadius: 0, // Flat look like FB
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  header: { flexDirection: "row", marginBottom: 12, alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  author: { fontWeight: "bold", fontSize: 16 },
  timestamp: { color: "#65676b", fontSize: 12 },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4fff0ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  audioText: { marginLeft: 8, color: colors.secondary2, fontWeight: "600" },
  contentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingTop: 12,
  },
  actionText: { color: "#65676b", fontWeight: "600" },
  translationBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  translationText: { fontStyle: "italic", color: "#444" },
  saveIcon: { paddingHorizontal: 5 },
});
