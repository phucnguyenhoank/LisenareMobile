import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { request } from "@/services/client";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import { WordSegmentSecond } from "@/types/forced-alignment";
import { SentenceTranslateResponse } from "@/types/sentence";
import { Reaction, Snippet } from "@/types/snippet";
import { InteractionType, logInteraction } from "@/utils/log-interaction";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { router } from "expo-router";
import FeedFooter from "./FeedFooter";
import FeedHeader from "./FeedHeader";
import SnippetAudioPlayerButton from "./SnippetAudioPlayerButton";
import SnippetContent from "./SnippetContent";
import TranslationSection from "./TranslationSection";
import { showDialog } from "@/utils/dialogs";

interface FeedItemProps {
  item: Snippet;
}

export default function FeedItem({ item }: FeedItemProps) {
  const { sessionId } = useSession();
  const { token } = useAuth();

  const { audioPath, isAudioLoading } = useCachedAudio(item.audio_path);
  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);

  const [reaction, setReaction] = useState<Reaction>(item.reaction);
  const [isAdding, setIsAdding] = useState(false);

  const [hasClickedAdd, setHasClickedAdd] = useState(false);

  const { data: segments = [] } = useQuery({
    queryKey: ["segments", item.audio_path],
    queryFn: () =>
      request<WordSegmentSecond[]>(`/text/forced_alignment/${item.audio_path}`),
    staleTime: Infinity,
  });

  const playSnippetAudio = (startTime: number = 0) => {
    player.volume = 1.0;
    player.seekTo(startTime);
    player.play();

    logInteraction({
      sessionId,
      snippetId: item.id,
      type: InteractionType.LISTEN,
    });
  };

  const handleReact = (nextReaction: Reaction) => {
    if (!token) {
      showDialog({
        title: "Authentication Required",
        message:
          "Please log in to access this feature and track your learning progress.",
        confirmText: "Log In",
        cancelText: "Maybe Later",
        showCancel: true,
        onConfirm: () =>
          router.push({
            pathname: "/setting",
            params: { from: "auth_required" },
          }),
      });
      return;
    }

    setReaction(nextReaction);

    let interactionType: InteractionType;

    if (nextReaction === "LIKE") {
      interactionType = InteractionType.LIKE;
    } else if (nextReaction === "DISLIKE") {
      interactionType = InteractionType.DISLIKE;
    } else {
      interactionType = InteractionType.REMOVE_REACTION;
    }

    logInteraction({
      sessionId,
      snippetId: item.id,
      type: interactionType,
    });
  };

  const getTranslation = async () => {
    if (item.translation) return item.translation;

    const res = await request<SentenceTranslateResponse>("/text/translations", {
      method: "POST",
      body: { text: item.content },
    });

    return res.text;
  };

  const handleAddBrick = async () => {
    if (isAdding) return;

    if (!token) {
      showDialog({
        title: "Authentication Required",
        message:
          "Please log in to access this feature and track your learning progress.",
        confirmText: "Log In",
        cancelText: "Maybe Later",
        showCancel: true,
        onConfirm: () =>
          router.push({
            pathname: "/setting",
            params: { from: "auth_required" },
          }),
      });
      return;
    }

    setIsAdding(true);

    try {
      const finalTranslation = await getTranslation();

      if (!hasClickedAdd) {
        setHasClickedAdd(true);

        logInteraction({
          sessionId,
          snippetId: item.id,
          type: InteractionType.ADD,
        });
      }

      router.push({
        pathname: "/add-brick",
        params: {
          native: finalTranslation,
          target: item.content,
          audio_path: audioPath,
        },
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.card}>
      <FeedHeader creator={item.creator} created_at={item.created_at} />

      <SnippetAudioPlayerButton
        isLoading={isAudioLoading}
        onPress={() => playSnippetAudio()}
      />

      <SnippetContent
        content={item.content}
        segments={segments}
        onPlay={playSnippetAudio}
      />

      <TranslationSection item={item} />

      <FeedFooter
        reaction={reaction}
        onReact={handleReact}
        onAdd={handleAddBrick}
        isAdding={isAdding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
  },
});
