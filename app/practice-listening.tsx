import { request } from "@/services/client";
import CollectionSelector from "@/features/practice-listening/CollectionSelector"; // Updated path/name
import PlayerCard from "@/features/practice-listening/PlayerCard";
import SentenceList from "@/features/practice-listening/SentenceList";
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
import { Collection } from "@/types/collection";

const buildAudioParams = (
  offset: number,
  limit: number,
  collectionIds: number[],
  isAll: boolean,
) => {
  const baseParams = [`offset=${offset}`, `limit=${limit}`];

  if (!isAll && collectionIds.length > 0) {
    collectionIds.forEach((id) => {
      baseParams.push(`collection_ids=${id}`);
    });
  }

  return `?${baseParams.join("&")}`;
};

export default function ListeningPracticeScreen() {
  const insets = useSafeAreaInsets();

  // 1. Updated string arrays to numeric IDs arrays
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>(
    [],
  );

  const { data: collections = [], isLoading: isLoadingCollections } = useQuery({
    queryKey: ["pending-collections"],
    queryFn: () => request<Collection[]>("/collections/pending"),
  });

  const {
    data,
    isFetching: isFetchingAudios,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["bricks-audio", selectedCollectionIds, isAllSelected],
    queryFn: ({ pageParam = 0 }) => {
      const params = buildAudioParams(
        pageParam,
        20,
        selectedCollectionIds,
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
  }, [data?.pages]);

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
  }, [status?.didJustFinish, autoPlayNext, audioItems.length]); // Added complete dependency array keys

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

  // 5. Updated event handler to accept a numeric ID layout array
  const handleCollectionChange = (isAll: boolean, newSelectedIds: number[]) => {
    setIsAllSelected(isAll);
    setSelectedCollectionIds(newSelectedIds);
    setCurrentIndex(null); // Reset player index when filter filters content array change
  };

  useEffect(() => {
    if (currentIndex === null) return;

    if (hasNextPage && currentIndex >= audioItems.length - 5) {
      fetchNextPage();
    }
  }, [currentIndex, hasNextPage, audioItems.length, fetchNextPage]); // Fixed complete dependency array requirements

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 6. Bound corrected typed props hooks */}
      <CollectionSelector
        collections={collections}
        isLoadingCollections={isLoadingCollections}
        selectedCollectionIds={selectedCollectionIds}
        isAllSelected={isAllSelected}
        onCollectionChange={handleCollectionChange}
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
