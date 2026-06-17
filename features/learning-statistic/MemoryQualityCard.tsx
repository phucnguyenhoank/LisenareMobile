import { C } from "@/theme/grammar_constants";
import { View, StyleSheet, Text } from "react-native";
import { BlockBigStat, CardHeader } from "./CardHeader";

export default function MemoryQualityCard({ retention, stability, scope }: any) {
  return (
    <View style={styles.card}>
      <CardHeader title="Chất lượng ghi nhớ" scope={scope} />
      <View style={styles.dualMetricsRow}>
        <BlockBigStat label="Tỷ lệ nhớ đúng" value={retention} />
        <BlockBigStat label="Độ ổn định" value={stability} />
      </View>
      <Text style={styles.explainText}>
        • Tỷ lệ nhớ đúng: % số lần bạn trả lời đúng{"\n"}• Độ ổn định: số ngày trung bình bạn nhớ được một thẻ
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  dualMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  explainText: {
    fontSize: 12,
    lineHeight: 18,
    color: C.textSoft,
  },
});
