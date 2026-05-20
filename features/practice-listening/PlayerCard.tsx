import { BrickAudioData } from "@/types/brick";
import colors from "@/theme/colors";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  currentItem: BrickAudioData | null;
  currentIndex: number | null;
  totalItems: number;
  isLoading: boolean;
};

export default function PlayerCard({
  currentItem,
  currentIndex,
  totalItems,
  isLoading,
}: Props) {
  return (
    <View style={styles.playerCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.progress}>
          {totalItems > 0 && currentIndex
            ? `${currentIndex + 1} / ${totalItems}`
            : "No audio loaded"}
        </Text>
      </View>

      <View style={styles.currentSentenceBox}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.targetText} numberOfLines={7}>
            {currentItem?.target_text ?? "Tap a sentence below"}
          </Text>

          <Text style={styles.nativeText} numberOfLines={6}>
            {currentItem?.native_text ?? "It will show here."}
          </Text>
        </ScrollView>
      </View>

      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.secondary} />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  playerCard: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: "#fafafa",
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  progress: {
    fontSize: 13,
    color: "#777",
  },

  currentSentenceBox: {
    minHeight: 180, // Increased to use more space
    maxHeight: 220, // Prevents it from becoming too tall
    justifyContent: "center",
  },
  scrollContent: {
    paddingVertical: 4,
  },

  targetText: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "700",
    color: "#111",
  },
  nativeText: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 24,
    color: "#555",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 13,
    color: "#666",
  },
});
