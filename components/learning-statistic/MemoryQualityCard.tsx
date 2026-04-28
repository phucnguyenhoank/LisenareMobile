import colors from "@/theme/colors";
import { View, StyleSheet, Text } from "react-native";
import { BlockBigStat, CardHeader } from "./CardHeader";

export default function MemoryQualityCard({
  retention,
  stability,
  scope,
}: any) {
  return (
    <View style={styles.card}>
      <CardHeader title="Chất lượng ghi nhớ" scope={scope} />

      <View style={styles.dualMetricsRow}>
        <BlockBigStat label="Tỷ lệ nhớ đúng" value={retention} />
        <BlockBigStat label="Độ ổn định" value={stability} />
      </View>

      <Text style={styles.explainText}>
        • Tỷ lệ nhớ đúng: % số lần bạn trả lời đúng{"\n"}• Độ ổn định: số ngày
        trung bình bạn nhớ được một thẻ
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  dualMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  explainText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#777",
  },
});
