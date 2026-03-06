import type { Collection } from "@/types/collection";
import Entypo from "@expo/vector-icons/Entypo";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: Collection;
};

export function CollectionRow({ item }: Props) {
  const getStatusColor = () => {
    if (item.learned_count === 0) return "transparent";
    const learned_ratio = item.learned_count / item.brick_count;

    if (learned_ratio < 0.34) return "#FF5252";
    if (learned_ratio < 0.67) return "#FFB100";
    return "#4CAF50";
  };

  const statusColor = getStatusColor();

  return (
    <Link
      href={{
        pathname: "/learn-collection",
        params: { collection_id: item.id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
        {/* Visual indicator bar */}
        <View style={[styles.indicator, { backgroundColor: statusColor }]} />

        <View style={styles.content}>
          <View style={styles.textGroup}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.subtitle}>
              {item.learned_count} / {item.brick_count}{" "}
              {item.brick_count === 1 ? "brick" : "bricks"}
            </Text>
          </View>
          <Entypo name="chevron-right" size={20} color="#CCC" />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  indicator: {
    width: 6,
    height: "100%",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
});
