import { request } from "@/api/client";
import GroupSelector from "@/components/listening-practice/GroupSelector";
import PlayerCard from "@/components/listening-practice/PlayerCard";
import SentenceList from "@/components/listening-practice/SentenceList";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import { BrickAudioPage } from "@/types/brick";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const buildAudioParams = (
  offset: number,
  limit: number,
  groupNames: string[],
  isAll: boolean,
) => {
  const params = new URLSearchParams();

  params.append("offset", offset.toString());
  params.append("limit", limit.toString());
  // params.append("shuffle_page", "true"); // randomization per page

  if (!isAll && groupNames.length > 0) {
    groupNames.forEach((g) => params.append("group_names", g));
  }

  return params.toString() ? `?${params.toString()}` : "";
};

export default function ListeningPracticeScreen() {
  const insets = useSafeAreaInsets();

  // Group selection
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Group data fetching
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["pending-groups"],
    queryFn: () => request<string[]>("/collections/pending-groups"),
  });

  const {
    data,
    isFetching: isFetchingAudios,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["bricks-audio", selectedGroups, isAllSelected],
    queryFn: ({ pageParam = 0 }) => {
      const params = buildAudioParams(
        pageParam,
        20,
        selectedGroups,
        isAllSelected,
      );
      return request<BrickAudioPage>(`/bricks/audio${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
  });

  const audioItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data?.pages]);

  const totalItems = useMemo(() => {
    return data?.pages[0]?.total ?? 0;
  }, [selectedGroups]);

  // Playback State
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const currentItem = currentIndex !== null ? audioItems[currentIndex] : null;
  const currentRemoteUri = currentItem?.audio_path ?? null;

  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // Audio
  const { audioPath: localAudioPath, isAudioLoading } =
    useCachedAudio(currentRemoteUri);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const showLoading = isFetchingAudios || isAudioLoading;

  useEffect(() => {
    if (localAudioPath) {
      player.replace({ uri: localAudioPath });
      player.seekTo(0);
      player.play();
    }
  }, [localAudioPath]);

  useEffect(() => {
    if (status?.didJustFinish) {
      if (
        autoPlayNext &&
        currentIndex !== null &&
        currentIndex < audioItems.length - 1
      ) {
        setCurrentIndex((prev) => (prev !== null ? prev + 1 : null));
      }
    }
  }, [status?.didJustFinish]);

  const handleSentencePress = (index: number) => {
    if (index === currentIndex && localAudioPath) {
      player.seekTo(0);
      player.play();
      return;
    }
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setAutoPlayNext((prev) => !prev);
  };

  const handleGroupChange = (isAll: boolean, newSelected: string[]) => {
    setIsAllSelected(isAll);
    setSelectedGroups(newSelected);
  };

  useEffect(() => {
    if (currentIndex === null) return;

    // load more when 5 items left
    if (hasNextPage && currentIndex >= audioItems.length - 5) {
      fetchNextPage();
    }
  }, [currentIndex]);

  useEffect(() => {
    // Configure audio session for background playback
    // TODO: Currently it only play in 1 batch only
    // it cannot automatically make a request
    // to a new batch and play in background
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GroupSelector
        groups={groups}
        isLoadingGroups={isLoadingGroups}
        selectedGroups={selectedGroups}
        isAllSelected={isAllSelected}
        onGroupChange={handleGroupChange}
      />

      <PlayerCard
        currentItem={currentItem}
        currentIndex={currentIndex}
        totalItems={totalItems}
        isLoading={showLoading}
      />

      <SentenceList
        audioItems={audioItems}
        currentIndex={currentIndex}
        autoPlayNext={autoPlayNext}
        onSentencePress={handleSentencePress}
        onToggleAutoPlay={toggleAutoPlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 18,
  },
});
