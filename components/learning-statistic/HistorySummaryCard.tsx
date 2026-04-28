import colors from "@/theme/colors";
import { View, StyleSheet } from "react-native";
import { CardHeader, CompactStat } from "./CardHeader";

export default function HistorySummaryCard({
  total,
  mastered,
  due,
  retention,
  stability,
}: any) {
  return (
    <View style={styles.card}>
      <CardHeader title="Toàn bộ lịch sử" />

      <View style={styles.compactGrid}>
        <CompactStat label="Đã học" value={total} color={colors.primary} />
        <CompactStat
          label="Thành thạo"
          value={mastered}
          color={colors.secondary2}
        />
        <CompactStat label="Cần luyện" value={due} color={colors.important} />
        <CompactStat label="Tỷ lệ nhớ đúng" value={retention} />
        <CompactStat label="Độ ổn định" value={stability} />
      </View>
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

  compactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
