import { request } from "@/api/client";
import colors from "@/theme/colors";
import { SimpleBrick } from "@/types/brick";
import type { Collection } from "@/types/collection";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BrickListDropdown } from "./BrickListDropdown";

type Props = {
  item: Collection;
};

export function CollectionRow({ item }: Props) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [pendingBricks, setPendingBricks] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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

    if (newState && !hasFetched) {
      setIsLoading(true);
      try {
        const data = await request<SimpleBrick[]>(
          `/collections/pending-bricks?collection_id=${item.id}`,
        );
        setPendingBricks(data);
        setHasFetched(true); // Mark as done
      } catch (err) {
        console.error("Failed to load pending bricks", err);
      } finally {
        setIsLoading(false); // Stop loading regardless of success/error
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
  const performDelete = async (brickId: number) => {
    try {
      // 1. Call your delete endpoint
      await request(`/bricks/${brickId}`, {
        method: "DELETE",
      });

      // 2. Update local state so the UI reflects the deletion immediately
      setPendingBricks((prevBricks) =>
        prevBricks.filter((b) => b.id !== brickId),
      );

      console.log("Brick deleted successfully");
    } catch (err: any) {
      Alert.alert("Không thể xóa", err.message);
      console.log(err);
    }
  };

  const handleDeleteBrick = (brickId: number) => {
    Alert.alert(
      "Bạn có chắc muốn xóa Brick này?", // Title
      "Xóa brick KHÔNG THỂ HOÀN TÁC và tất cả tương tác với brick này sẽ MẤT VĨNH VIỄN.",
      [
        {
          text: "Thoát",
          style: "cancel", // No action taken
        },
        {
          text: "Xóa",
          style: "destructive", // Red text on iOS
          onPress: () => performDelete(brickId),
        },
      ],
      { cancelable: true },
    );
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
          <View style={styles.leftSection}>
            <Entypo
              name={expanded ? "chevron-down" : "chevron-right"}
              size={18}
              color="#999"
            />

            <View style={styles.textGroup}>
              <Text style={styles.title} numberOfLines={4}>
                {item.name.trim().replace(/\.$/, "")}
              </Text>
              <Text style={styles.subtitle}>
                {item.learned_count} / {item.brick_count}{" "}
                {item.brick_count === 1 ? "brick" : "bricks"}
              </Text>
            </View>
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
          isLoading={isLoading}
          onEdit={handleEditBrick}
          onDelete={handleDeleteBrick}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FAFAFA", // softer than white
    overflow: "hidden",
    elevation: 1,
  },

  indicator: {
    width: 5,
    height: "100%",
  },

  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18, // more breathing space
    paddingHorizontal: 16,
    gap: 12,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  textGroup: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "700", // stronger
    color: "#111",
    letterSpacing: 0.2,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: "#888", // softer
  },

  learnBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,

    // subtle depth
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  learnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
});
