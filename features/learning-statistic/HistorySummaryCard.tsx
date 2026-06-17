import { C } from "@/theme/grammar_constants";
import { View, StyleSheet } from "react-native";
import { CardHeader, CompactStat } from "./CardHeader";

export default function HistorySummaryCard({ total, mastered, due, retention, stability }: any) {
  return (
    <View style={styles.card}>
      <CardHeader title="Toàn bộ lịch sử" />
      <View style={styles.compactGrid}>
        <CompactStat label="Đã học" value={total} color={C.primary} />
        <CompactStat label="Thành thạo" value={mastered} color="#3D5A2A" />
        <CompactStat label="Cần luyện" value={due} color="#EF4444" />
        <CompactStat label="Tỷ lệ nhớ đúng" value={retention} />
        <CompactStat label="Độ ổn định" value={stability} />
      </View>
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
  compactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
