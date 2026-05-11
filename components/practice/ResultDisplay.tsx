import colors from "@/theme/colors";
import type { SentenceCompareResponse } from "@/types/comparison";
import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "../IconButton";

type Props = {
  result: SentenceCompareResponse;
  targetText?: string;
  userAnswerText?: string;
  onNext: () => void;
  onPlaySound: () => void;
  onPlayUserRecordedSound: () => void;
};

const getStars = (score: number) => {
  if (score >= 0.9) return 5;
  if (score >= 0.75) return 4;
  if (score >= 0.6) return 3;
  if (score >= 0.4) return 2;
  if (score >= 0.2) return 1;
  return 0;
};

const StarRating = ({ score }: { score: number }) => {
  const stars = getStars(score);
  return (
    <View style={styles.starRow}>
      {[...Array(5)].map((_, i) => (
        <FontAwesome
          key={i}
          name={i < stars ? "star" : "star-o"}
          size={28}
          color={i < stars ? "#FFD700" : "#ccc"} // gold / gray
        />
      ))}
    </View>
  );
};

export default function ResultDisplay({
  result,
  targetText,
  userAnswerText,
  onNext,
  onPlaySound,
  onPlayUserRecordedSound,
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
      {/* Target */}
      {targetText && <Text style={styles.targetText}>{targetText}</Text>}

      {/* User Answer */}
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

      {/* RESULT (moved up) */}
      <StarRating score={result.score} />

      {/* ACTION ROW */}
      <View style={styles.actionsRow}>
        <IconButton
          onPress={onPlaySound}
          icon={<AntDesign name="sound" size={20} color="white" />}
          style={styles.smallButton}
        />

        <IconButton
          onPress={onPlayUserRecordedSound}
          icon={<AntDesign name="sound" size={20} color="white" />}
          style={styles.smallButtonAlt}
        />

        <IconButton
          onPress={onNext}
          icon={<FontAwesome name="arrow-right" size={20} color="white" />}
          style={styles.primaryButton}
        />
      </View>

      {/* optional: keep but de-emphasize */}
      <Text style={styles.scoreSubtle}>{Math.round(result.score * 100)}%</Text>
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

  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },

  smallButton: {
    backgroundColor: colors.secondary2,
    padding: 14,
    borderRadius: 50,
  },

  smallButtonAlt: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 50,
  },

  primaryButton: {
    backgroundColor: colors.secondary2,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
  },

  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },

  scoreSubtle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
