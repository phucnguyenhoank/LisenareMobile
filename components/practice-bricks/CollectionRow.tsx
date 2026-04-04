import { request } from "@/api/client";
import colors from "@/theme/colors";
import { SimpleBrick } from "@/types/brick";
import type { Collection } from "@/types/collection";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BrickListDropdown } from "./BrickListDropdown";

type Props = {
  item: Collection;
};

export function CollectionRow({ item }: Props) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [pendingBricks, setPendingBricks] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const getStatusColor = () => {
    if (item.learned_count === 0) return "transparent";
    const ratio = (item.learned_count ?? 0) / (item.brick_count ?? 1);

    if (ratio < 0.34) return "#FF5252";
    if (ratio < 0.67) return "#FFB100";
    return "#4CAF50";
  };

  const toggleExpand = async () => {
    const newState = !expanded;
    setExpanded(newState);

    if (newState && !loaded) {
      try {
        const data = await request<SimpleBrick[]>(
          `/collections/pending-bricks?collection_id=${item.id}`,
        );
        setPendingBricks(data);
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load pending bricks", err);
      }
    }
  };

  const goToLearn = () => {
    router.push({
      pathname: "/learn-collection",
      params: { collection_id: item.id },
    });
  };

  const handleEditBrick = (brickId: number) => {
    router.push({
      pathname: "/edit-brick",
      params: { brick_id: brickId },
    });
  };

  return (
    <View style={{ marginBottom: 10 }}>
      {/* Main Row */}
      <TouchableOpacity
        style={styles.listItem}
        activeOpacity={0.7}
        onPress={toggleExpand}
      >
        <View style={styles.content}>
          <Entypo
            name={expanded ? "chevron-down" : "chevron-right"}
            size={20}
            color="#CCC"
          />

          <View style={styles.textGroup}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name.trim().replace(/\.$/, "")}
            </Text>
            <Text style={styles.subtitle}>
              {item.learned_count} / {item.brick_count}{" "}
              {item.brick_count === 1 ? "brick" : "bricks"}
            </Text>
          </View>

          <TouchableOpacity style={styles.learnBtn} onPress={goToLearn}>
            <Text style={styles.learnText}>Learn</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.indicator, { backgroundColor: getStatusColor() }]}
        />
      </TouchableOpacity>

      {expanded && (
        <BrickListDropdown
          bricks={pendingBricks}
          onEdit={handleEditBrick}
          onDelete={(id) => console.log("Delete", id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
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
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  learnBtn: {
    backgroundColor: colors.secondary2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  learnText: {
    color: "white",
    fontWeight: "600",
  },
});
