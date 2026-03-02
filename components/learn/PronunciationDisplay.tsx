import colors from "@/theme/colors";
import type { PronunciationAnalysisResponse } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PronunciationDisplayProps {
  targetText: string;
  data: PronunciationAnalysisResponse;
  onNext?: () => void;
}

const PronunciationDisplay = ({
  targetText,
  data,
  onNext,
}: PronunciationDisplayProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Target Sentence:</Text>
      <Text style={styles.targetText}>{targetText}</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Accuracy:</Text>
        <Text
          style={[
            styles.scoreValue,
            { color: getScoreColor(data.accuracy_score) },
          ]}
        >
          {(data.accuracy_score * 100).toFixed(0)}%
        </Text>
      </View>

      <Text style={styles.label}>IPA Analysis:</Text>
      <View style={styles.phonemeList}>
        {data.analysis.map((item, index) => (
          <View key={index} style={styles.phonemeBox}>
            <Text style={[styles.phonemeText, styles[item.status]]}>
              {item.phoneme}
            </Text>
            {/* Show what the AI heard if mispronounced */}
            {item.status === "mispronounced" && item.heard && (
              <Text style={styles.heardText}>({item.heard})</Text>
            )}
            {/* Visual indicator for missing sounds */}
            {item.status === "missing" && (
              <View style={styles.missingUnderline} />
            )}
          </View>
        ))}
      </View>

      {onNext && (
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Ionicons
            name="arrow-forward-circle"
            size={40}
            color={colors.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Helper to color the total score
const getScoreColor = (score: number) => {
  if (score > 0.8) return colors.secondary5; // Green
  if (score > 0.5) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  targetText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  phonemeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  phonemeBox: {
    alignItems: "center",
    marginRight: 6,
    marginBottom: 10,
    minWidth: 20,
  },
  phonemeText: {
    fontSize: 22,
    fontFamily: "System", // IPA characters usually render well in system fonts
    fontWeight: "500",
  },
  heardText: {
    fontSize: 10,
    color: "#f44336",
    marginTop: 2,
  },
  missingUnderline: {
    height: 2,
    width: "100%",
    backgroundColor: "#bdbdbd",
    marginTop: 2,
  },
  // Status Styles
  correct: {
    color: colors.secondary5,
  },
  mispronounced: {
    color: "#FF9800",
  },
  missing: {
    color: "#bdbdbd",
    textDecorationLine: "line-through",
  },
  extra: {
    color: "#F44336",
    borderBottomWidth: 1,
    borderBottomColor: "#F44336",
  },

  // Next button
  nextButton: {
    alignSelf: "flex-end",
    marginTop: 16,
  },
});

export default PronunciationDisplay;
