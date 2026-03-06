import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import { BrickContextSearchResult } from "@/types/context-search";
import React from "react";
import {
  StyleSheet,
  Text,
  View
} from "react-native";

export default function BrickCard({
  item,
}: {
  item: BrickContextSearchResult;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.quote}>{item.target_text}</Text>

        <Text style={styles.nativeText}>{item.native_text}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.cefr_level}</Text>
        </View>
      </View>
    </View>
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
