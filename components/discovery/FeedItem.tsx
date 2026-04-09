import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import colors from "@/theme/colors";
import { WordSegmentSecond } from "@/types/forced-alignment";
import { Post } from "@/types/post";
import { SentenceTranslateResponse } from "@/types/sentence";
import { showAlert } from "@/utils/alerts";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import Word from "./Word";

interface FeedItemProps {
  item: Post;
}

export default function FeedItem({ item }: FeedItemProps) {
  const { token } = useAuth();
  const [showFullTranslation, setShowFullTranslation] = useState(false);
  const [fetchedTranslation, setFetchedTranslation] = useState(
    item.translation || "",
  );
  const { audioPath, isAudioLoading } = useCachedAudio(item.audio_uri);
  const [segments, setSegments] = useState<WordSegmentSecond[]>([]);
  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const playPostAudio = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();
  };

  const showTranslation = async () => {
    const nextState = !showFullTranslation;
    setShowFullTranslation(nextState);

    if (nextState && !fetchedTranslation) {
      setIsLoading(true);
      try {
        const sentenceTranslation = await request<SentenceTranslateResponse>(
          "/text/translations",
          {
            method: "POST",
            body: { text: item.content },
          },
        );
        setFetchedTranslation(sentenceTranslation.text);
      } catch (error) {
        console.error("Translation failed", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddBrick = async () => {
    if (!token) {
      Alert.alert("Thông báo", "Bạn hãy đăng nhập trước nhé");
      showAlert({
        title: "Thông báo",
        message: "Bạn hãy đăng nhập trước nhé",
        confirmText: "Đăng nhập",
        onConfirm: () => {
          router.push("/setting");
        },
      });
      return;
    }

    let finalTranslation = item.translation || fetchedTranslation;
    if (!finalTranslation) {
      try {
        setIsLoading(true);

        const res = await request<SentenceTranslateResponse>(
          "/text/translations",
          {
            method: "POST",
            body: { text: item.content },
          },
        );

        finalTranslation = res.text;
        setFetchedTranslation(res.text); // cache it
      } catch (error) {
        console.error("Translation failed", error);
        finalTranslation = "";
      } finally {
        setIsLoading(false);
      }
    }
    router.push({
      pathname: "/add-brick",
      params: {
        native: finalTranslation,
        target: item.content, // The original text
        audio_uri: audioPath,
      },
    });
  };

  useEffect(() => {
    (async () => {
      const word_segments = await request<WordSegmentSecond[]>(
        `/text/forced_alignment/${item.audio_uri}`,
      );
      setSegments(word_segments);
    })();
  }, []);

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
          <Text style={styles.timestamp}>
            {item.created_at
              ? formatDistanceToNow(
                  // 1. Convert space to 'T' for strict ISO compliance
                  // 2. Append 'Z' to force UTC interpretation
                  new Date(item.created_at.replace(" ", "T") + "Z"),
                  { addSuffix: true },
                )
              : ""}
          </Text>
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
          <Word
            key={index}
            word={word}
            segment={segments[index]}
            player={player}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={showTranslation}>
          <Text style={styles.actionText}>
            {showFullTranslation ? "Hide Translation" : "View Translation"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveIcon}
          onPress={handleAddBrick}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.secondary2} />
          ) : (
            <FontAwesome6 name="add" size={24} color={colors.secondary2} />
          )}
        </TouchableOpacity>
      </View>

      {showFullTranslation && (
        <View style={styles.translationBox}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.translationText}>{fetchedTranslation}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 4,
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
