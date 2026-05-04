import colors from "@/theme/colors";
import { BrickAudioData } from "@/types/brick";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  audioItems: BrickAudioData[];
  currentIndex: number | null;
  autoPlayNext: boolean;
  onSentencePress: (index: number) => void;
  onToggleAutoPlay: () => void;
};

export default function SentenceList({
  audioItems,
  currentIndex,
  autoPlayNext,
  onSentencePress,
  onToggleAutoPlay,
}: Props) {
  return (
    <View style={styles.listSection}>
      <View style={styles.listHeader}>
        <Pressable
          style={styles.autoPlayButton}
          onPress={onToggleAutoPlay}
          hitSlop={8}
        >
          <Feather
            name="repeat"
            size={20}
            color={autoPlayNext ? colors.secondary : "#999"}
          />
          <Text
            style={[
              styles.autoPlayText,
              autoPlayNext && styles.autoPlayTextActive,
            ]}
          >
            Auto
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={audioItems}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const active = index === currentIndex;

          return (
            <Pressable
              style={[styles.sentenceItem, active && styles.sentenceItemActive]}
              onPress={() => onSentencePress(index)}
            >
              <View style={styles.sentenceIndex}>
                <Text
                  style={[styles.indexText, active && styles.indexTextActive]}
                >
                  {index + 1}
                </Text>
              </View>

              <View style={styles.sentenceBody}>
                <Text style={styles.sentenceText} numberOfLines={2}>
                  {item.target_text}
                </Text>
                <Text style={styles.sentenceNative} numberOfLines={2}>
                  {item.native_text}
                </Text>
              </View>

              <Feather
                name="play-circle"
                size={22}
                color={active ? colors.secondary : "#999"}
              />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sentences loaded yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listSection: {
    flex: 1,
    marginTop: 18,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  autoPlayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  autoPlayText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
  },
  autoPlayTextActive: {
    color: colors.secondary,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  sentenceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#f8f8f8",
  },
  sentenceItemActive: {
    backgroundColor: "#f3ffee",
    borderWidth: 1,
    borderColor: "#e3ffd8",
  },
  sentenceIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  indexText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  indexTextActive: {
    color: colors.secondary,
  },
  sentenceBody: {
    flex: 1,
  },
  sentenceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  sentenceNative: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },
  emptyText: {
    marginTop: 14,
    color: "#888",
    fontSize: 14,
  },
});
