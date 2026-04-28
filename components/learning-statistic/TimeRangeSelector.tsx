import { TimeRange } from "@/types/learner-statistic";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import colors from "@/theme/colors";

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "30d", label: "30 ngày" },
  { key: "90d", label: "90 ngày" },
  { key: "365d", label: "365 ngày" },
  { key: "all", label: "Tất cả" },
];

export default function TimeRangeSelector({
  selectedRange,
  onChange,
}: {
  selectedRange: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  return (
    <View style={styles.rangeRow}>
      {TIME_RANGES.map((range) => {
        const isSelected = selectedRange === range.key;

        return (
          <Pressable
            key={range.key}
            onPress={() => onChange(range.key)}
            style={[styles.rangeBtn, isSelected && styles.rangeBtnActive]}
          >
            <Text
              style={[styles.rangeText, isSelected && styles.rangeTextActive]}
            >
              {range.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rangeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },
  rangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    marginRight: 8,
    marginBottom: 8,
  },
  rangeBtnActive: {
    backgroundColor: colors.secondary,
  },
  rangeText: {
    fontSize: 13,
    color: "#444",
  },
  rangeTextActive: {
    color: "white",
  },
});
