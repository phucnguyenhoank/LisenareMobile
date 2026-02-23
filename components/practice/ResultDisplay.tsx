import colors from "@/theme/colors";
import type { SentenceCompareResponse } from "@/types/comparison";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "../IconButton";

type Props = {
  result: SentenceCompareResponse;
  targetText?: string;
  userAnswerText?: string;
  onNext: () => void;
  onPlaySound: () => void;
};

export default function ResultDisplay({
  result,
  targetText,
  userAnswerText,
  onNext,
  onPlaySound,
}: Props) {
  // Normalize function (lowercase + remove punctuation)
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .trim();

  // Create a Set of target words for fast lookup
  const targetWords = new Set(
    targetText ? normalize(targetText).split(/\s+/) : [],
  );

  // Split user answer words (keep original for rendering)
  const userWords = userAnswerText ? userAnswerText.split(/\s+/) : [];

  return (
    <View style={styles.sheetContent}>
      {/* Target Text */}
      {targetText && <Text style={styles.targetText}>{targetText}</Text>}

      {/* User Answer with Highlight */}
      {userAnswerText && (
        <Text style={styles.userAnswer}>
          {userWords.map((word, index) => {
            const normalizedWord = normalize(word);

            const isExtra = !targetWords.has(normalizedWord);

            return (
              <Text key={index} style={isExtra ? styles.highlight : undefined}>
                {word + " "}
              </Text>
            );
          })}
        </Text>
      )}

      {/* Buttons */}
      <IconButton
        onPress={onPlaySound}
        icon={<AntDesign name="sound" size={24} color="white" />}
        style={styles.nextButton}
      />

      <IconButton
        onPress={onNext}
        icon={<FontAwesome name="check" size={24} color="white" />}
        style={styles.nextButton}
      />

      {/* Result */}
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
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
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

  userAnswer: {
    fontSize: 16,
    textAlign: "center",
  },

  highlight: {
    backgroundColor: "#fff3b0", // light yellow
    borderRadius: 4,
  },

  nextButton: {
    backgroundColor: colors.secondary2,
    paddingHorizontal: 56,
    paddingVertical: 14,
    borderRadius: 16,
  },
});
