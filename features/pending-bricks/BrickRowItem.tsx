import { Brick, UnitType } from "@/types/brick";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import colors from "@/theme/colors";

export default function BrickRowItem({
  brick,
  onLearn,
  onEdit,
  onDelete,
}: {
  brick: Brick;
  onLearn: (brickId: number) => void;
  onEdit: (brickId: number) => void;
  onDelete: (brickId: number) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isLearned = !!brick.learned;

  const getTagColor = (type: UnitType) => {
    switch (type?.toLowerCase()) {
      case "word":
        return { bg: "#E0F2FE", text: "#0369A1" };
      case "phrase":
        return { bg: "#FEE2E2", text: "#B91C1C" };
      case "sentence":
        return { bg: "#FEF3C7", text: "#B45309" };
      default:
        return { bg: "#F3F4F6", text: "#374151" };
    }
  };

  const tagStyle = getTagColor(brick.brick_metadata?.unit_type);

  return (
    <View style={[styles.cardContainer, isLearned && styles.learnedCard]}>
      {/* Main Tappable Surface for Learning Action */}
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => onLearn(brick.id)}
        style={styles.mainContent}
      >
        {/* Top Metadata Sub-Row */}
        <View style={styles.metaRow}>
          <View style={styles.badgeGroup}>
            <View style={[styles.tag, { backgroundColor: tagStyle.bg }]}>
              <Text style={[styles.tagText, { color: tagStyle.text }]}>
                {brick.brick_metadata?.unit_type || "Unknown"}
              </Text>
            </View>

            {isLearned && (
              <View style={styles.learnedBadge}>
                <Feather
                  name="check"
                  size={12}
                  color={colors.secondary5}
                  style={styles.boldWeight}
                />
                <Text style={styles.learnedText}>Learned</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            hitSlop={16}
            onPress={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            accessibilityLabel="More options"
            style={styles.menuButton}
          >
            <Feather
              name="more-vertical"
              size={20}
              color={colors.text}
              style={styles.opacityDim}
            />
          </TouchableOpacity>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.targetText}>{brick.target_text}</Text>
          <Text style={styles.nativeText}>{brick.native_text}</Text>
        </View>
      </TouchableOpacity>

      {/* Conditional Inline Context Menu */}
      {showMenu && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onEdit(brick.id);
              setShowMenu(false);
            }}
          >
            <Feather name="edit-2" size={16} color={colors.text} />
            <Text style={styles.menuItemText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.borderTop]}
            onPress={() => {
              onDelete(brick.id);
              setShowMenu(false);
            }}
          >
            <Feather name="trash-2" size={16} color={colors.important} />
            <Text style={[styles.menuItemText, { color: colors.important }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  learnedCard: {
    backgroundColor: "#FAFDF9",
  },
  mainContent: {
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuButton: {
    padding: 4,
    marginRight: -4,
  },
  opacityDim: {
    opacity: 0.6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 28,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  learnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 28,
  },
  learnedText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.secondary5,
  },
  boldWeight: {
    fontWeight: "900",
  },
  textContainer: {
    gap: 4,
  },
  targetText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.2,
  },
  nativeText: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.7,
    fontWeight: "400",
  },
  dropdownMenu: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.buttonBackground,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
});
