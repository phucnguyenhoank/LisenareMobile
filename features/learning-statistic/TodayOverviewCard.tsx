import { C } from "@/theme/grammar_constants";
import { View, StyleSheet } from "react-native";
import { BlockStat, Divider } from "./CardHeader";

export default function TodayOverviewCard({ total, mastered, due }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.row3}>
        <BlockStat label="Đã học" value={total} color={C.primary} />
        <Divider />
        <BlockStat label="Thành thạo" value={mastered} color="#3D5A2A" />
        <Divider />
        <BlockStat label="Cần luyện" value={due} color="#EF4444" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row3: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
});
