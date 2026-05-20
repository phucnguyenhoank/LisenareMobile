import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Absolute necessity for layout clipping

import colors from "@/theme/colors";
import { SystemLevel } from "@/types/collection";

interface Props {
  systemLevels: SystemLevel[];
  selectedSystemIds: number[];
  isSaving: boolean;
  onToggleLevel: (id: number) => void;
}

export default function SystemLevelSelector({
  systemLevels,
  selectedSystemIds,
  isSaving,
  onToggleLevel,
}: Props) {
  const insets = useSafeAreaInsets(); // Grabs exact hardware layout notch sizes safely

  return (
    // Applies dynamic top inset spacing dynamically across different phone hardware
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>SYSTEM COLLECTIONS</Text>
        <Text style={styles.counter}>{selectedSystemIds.length} selected</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {systemLevels.map((level) => {
          const selected = selectedSystemIds.includes(level.id);

          return (
            <Pressable
              key={level.id}
              onPress={() => onToggleLevel(level.id)}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipActive,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name={selected ? "checkmark-circle" : "add-circle-outline"}
                size={16}
                color={selected ? colors.background : colors.secondary3}
              />

              <Text
                style={[styles.chipText, selected && styles.chipTextActive]}
              >
                {level.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2, // Minor layout separation before rendering side scroll nodes
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.secondary2,
  },

  counter: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.8,
  },

  list: {
    gap: 8,
    paddingRight: 32, // More breathing room at the far right end when scrolling chips fully
    paddingVertical: 4, // Prevents Android shadow clipping on active chips
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    paddingHorizontal: 14,
    paddingVertical: 9,

    borderRadius: 999,

    backgroundColor: colors.buttonBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },

  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },

  chipTextActive: {
    color: colors.background,
  },
});
