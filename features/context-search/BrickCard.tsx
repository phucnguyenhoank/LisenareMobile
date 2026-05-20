import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import { BrickContextSearchResult } from "@/types/context-search";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BrickCard({
  item,
}: {
  item: BrickContextSearchResult;
}) {
  const router = useRouter();
  const handlePress = () => {
    // Navigate to your detail screen, passing the brick_id
    router.push({
      pathname: "/brick-details",
      params: { id: item.brick_id },
    });
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.info}>
        <Text style={styles.quote}>{item.target_text}</Text>
        <Text style={styles.nativeText}>{item.native_text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: 14,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#eee",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  info: {
    padding: spacing.lg,
  },

  quote: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    lineHeight: 22,
  },

  nativeText: {
    color: "#666",
    marginTop: spacing.sm,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F2FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: spacing.sm,
  },

  badgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
});
