import type { SentenceCompareResponse } from "@/types/comparison";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  result: SentenceCompareResponse;
};

export function ResultDisplay({ result }: Props) {
  return (
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
  );
}

const styles = StyleSheet.create({
  resultContainer: {
    marginTop: 15,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
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
    marginTop: 2,
  },
});
