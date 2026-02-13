import type { Collection } from "@/types/collection";
import Entypo from "@expo/vector-icons/Entypo";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: Collection;
};

export function CollectionRow({ item }: Props) {
  return (
    <Link
      href={{
        pathname: "/learn-collection",
        params: { collection_id: item.id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
        <View style={styles.left}>
          <Text style={styles.listItemText} numberOfLines={1}>
            {item.brick_count} | {item.name}
          </Text>
        </View>
        <Entypo name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", // Light separator line
  },

  left: {
    flex: 1,
    paddingRight: 8, // space before chevron
  },
  listItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
