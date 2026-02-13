import colors from "@/theme/colors";
import type { SentenceCompareResponse } from "@/types/comparison";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "../IconButton";

type Props = {
  result: SentenceCompareResponse;
  targetText?: string;
  onNext: () => void;
  onPlaySound: () => void;
};

export default function ResultDisplay({
  result,
  targetText,
  onNext,
  onPlaySound,
}: Props) {
  return (
    <View style={styles.sheetContent}>
      {/* Result Box */}
      <View style={styles.resultContainer}>
        <Text
          style={[
            styles.resultScore,
            { color: result.correct ? "green" : "#e74c3c" },
          ]}
        >
          {result.correct ? "Correct!" : "Try again"} (
          {Math.round(result.score * 100)}%)
        </Text>

        <Text style={styles.thresholdInfo}>Threshold: {result.threshold}</Text>
      </View>

      {/* Target Text */}
      {targetText && <Text style={styles.targetText}>{targetText}</Text>}

      {/* Buttons */}
      <IconButton
        onPress={onNext}
        icon={<FontAwesome name="check" size={24} color="white" />}
        style={styles.nextButton}
      />

      <IconButton
        onPress={onPlaySound}
        icon={<AntDesign name="sound" size={24} color="white" />}
        style={styles.nextButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },

  resultContainer: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    width: "85%",
  },

  resultScore: {
    fontSize: 18,
    fontWeight: "bold",
  },

  thresholdInfo: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  targetText: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.secondary2,
  },

  nextButton: {
    backgroundColor: colors.secondary2,
    paddingHorizontal: 56,
    paddingVertical: 14,
    borderRadius: 16,
  },
});
