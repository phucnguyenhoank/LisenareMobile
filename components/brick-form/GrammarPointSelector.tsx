import colors from "@/theme/colors";
import { GrammarPoint, UnitType } from "@/types/brick";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  unitType: UnitType;
  selectedPoints: GrammarPoint[];
  onToggle: (point: GrammarPoint) => void;
};

export function GrammarPointSelector({
  unitType,
  selectedPoints,
  onToggle,
}: Props) {
  // Filter points based on unit type to keep the list manageable
  const availablePoints = Object.values(GrammarPoint).filter((p) => {
    if (unitType === UnitType.word)
      return [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "preposition",
        "conjunction",
        "pronoun",
        "determiner",
      ].includes(p);
    if (unitType === UnitType.phrase) return p.endsWith("_phrase");
    if (unitType === UnitType.sentence)
      return (
        !p.endsWith("_phrase") &&
        ![
          "noun",
          "verb",
          "adjective",
          "adverb",
          "preposition",
          "conjunction",
          "pronoun",
          "determiner",
        ].includes(p)
      );
    return true;
  });

  return (
    <View style={styles.container}>
      {availablePoints.map((p) => {
        const isSelected = selectedPoints.includes(p);
        return (
          <TouchableOpacity
            key={p}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onToggle(p)}
          >
            <Text
              style={[styles.chipText, isSelected && styles.chipTextSelected]}
            >
              {p.replace(/_/g, " ")}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#E0E4E9",
  },
  chipSelected: {
    backgroundColor: colors.secondary2,
    borderColor: colors.secondary2,
  },
  chipText: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  chipTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },
});
