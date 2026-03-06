import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import { SearchMode } from "@/types/context-search";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  mode: string;
  setMode: (v: SearchMode) => void;
};

export default function ModeTabs({ mode, setMode }: Props) {
  return (
    <View style={styles.tabs}>
      {(["videos", "bricks"] as SearchMode[]).map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => setMode(m)}
          style={[styles.tab, mode === m && styles.tabActive]}
        >
          <Text style={mode === m ? styles.tabTextActive : styles.tabText}>
            {m === "videos" ? "Videos" : "Bricks"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: "#fff",
  },

  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: spacing.sm,
  },

  tabActive: {
    backgroundColor: colors.secondary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  tabTextActive: {
    color: "#fff",
  },
});
