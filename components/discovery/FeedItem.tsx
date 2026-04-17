import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { request } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import { WordSegmentSecond } from "@/types/forced-alignment";
import { SentenceTranslateResponse } from "@/types/sentence";
import { Snippet } from "@/types/snippet";
import { showAlert } from "@/utils/alerts";
import { InteractionType, logInteraction } from "@/utils/log-interaction";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import FeedFooter from "./FeedFooter";
import FeedHeader from "./FeedHeader";
import SnippetAudioPlayerButton from "./SnippetAudioPlayerButton";
import SnippetContent from "./SnippetContent";
import TranslationSection from "./TranslationSection";

interface FeedItemProps {
  item: Snippet;
}

export default function FeedItem({ item }: FeedItemProps) {
  const { sessionId } = useSession();
  const { token } = useAuth();
  const router = useRouter();

  const { audioPath, isAudioLoading } = useCachedAudio(item.audio_path);
  const player = useAudioPlayer(audioPath ? { uri: audioPath } : null);

  const [isHelpful, setIsHelpful] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [hasClickedAdd, setHasClickedAdd] = useState(false);

  const { data: segments = [] } = useQuery({
    queryKey: ["segments", item.audio_path],
    queryFn: () =>
      request<WordSegmentSecond[]>(`/text/forced_alignment/${item.audio_path}`),
    staleTime: Infinity,
  });

  const playSnippetAudio = () => {
    player.volume = 1.0;
    player.seekTo(0);
    player.play();

    logInteraction({
      sessionId,
      snippetId: item.id,
      type: InteractionType.LISTEN,
    });
  };

  const handleToggleHelpful = () => {
    const next = !isHelpful;
    setIsHelpful(next);

    logInteraction({
      sessionId,
      snippetId: item.id,
      type: next ? InteractionType.LIKE : InteractionType.UNLIKE,
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
      showAlert({
        title: "Thông báo",
        message: "Bạn hãy đăng nhập trước nhé",
        confirmText: "Đăng nhập",
        onConfirm: () => router.push("/setting"),
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
        onPress={playSnippetAudio}
      />

      <SnippetContent
        content={item.content}
        segments={segments}
        player={player}
      />

      <TranslationSection item={item} />

      <FeedFooter
        isHelpful={isHelpful}
        onToggleHelpful={handleToggleHelpful}
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
