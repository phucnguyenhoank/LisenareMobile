import colors from "@/theme/colors";
import { Text, View, StyleSheet } from "react-native";

export function CardHeader({ title, scope }: any) {
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      {scope && <Text style={styles.cardScope}>{scope}</Text>}
    </View>
  );
}

export function BlockStat({ label, value, color }: any) {
  return (
    <View style={styles.blockStat}>
      <Text style={[styles.blockValue, { color }]}>{value}</Text>
      <Text style={styles.blockLabel}>{label}</Text>
    </View>
  );
}

export function BlockBigStat({ label, value }: any) {
  return (
    <View style={styles.bigStat}>
      <Text style={styles.bigValue}>{value}</Text>
      <Text style={styles.blockLabel}>{label}</Text>
    </View>
  );
}

export function CompactStat({ label, value, color }: any) {
  return (
    <View style={styles.compactItem}>
      <Text style={[styles.compactValue, , { color }]}>{value}</Text>
      <Text style={styles.compactLabel}>{label}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  blockStat: {
    flex: 1,
    alignItems: "center",
  },

  blockValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.secondary2,
  },

  blockLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
  },

  bigStat: {
    flex: 1,
    alignItems: "center",
  },

  bigValue: {
    fontSize: 22,
    fontWeight: "bold",
  },

  compactItem: {
    width: "48%",
    marginBottom: 10,
  },

  compactValue: {
    fontWeight: "800",
    fontSize: 16,
  },

  compactLabel: {
    fontSize: 12,
    color: "#666",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  cardScope: {
    fontSize: 12,
    color: "#8A8A8F",
  },
});
