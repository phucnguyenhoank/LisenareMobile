import colors from "@/theme/colors";
import { View, StyleSheet } from "react-native";
import { BlockStat, Divider } from "./CardHeader";

export default function TodayOverviewCard({ total, mastered, due }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.row3}>
        <BlockStat label="Đã học" value={total} color={colors.primary} />
        <Divider />
        <BlockStat
          label="Thành thạo"
          value={mastered}
          color={colors.secondary2}
        />
        <Divider />
        <BlockStat label="Cần luyện" value={due} color={colors.important} />
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
    backgroundColor: "fff",

    padding: 16,
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
