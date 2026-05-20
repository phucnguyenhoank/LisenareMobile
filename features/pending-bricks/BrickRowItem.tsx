import { Brick, UnitType } from "@/types/brick";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import colors from "@/theme/colors";
import Button from "@/components/Button";

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

  // High-contrast tag colors that pop out against the dark forest theme
  const getTagColor = (type: UnitType) => {
    switch (type?.toLowerCase()) {
      case "word":
        return { bg: "#E0F2FE", text: "#0369A1" }; // Soft Blue
      case "phrase":
        return { bg: "#FEE2E2", text: "#B91C1C" }; // Soft Red
      case "sentence":
        return { bg: "#FEF3C7", text: "#B45309" }; // Soft Amber
      default:
        return { bg: "#F3F4F6", text: "#374151" }; // Gray
    }
  };

  const tagStyle = getTagColor(brick.brick_metadata?.unit_type);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.mainContent}>
        {/* Top Metadata Row */}
        <View style={styles.metaRow}>
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

          <TouchableOpacity
            hitSlop={12}
            onPress={() => setShowMenu(!showMenu)}
            accessibilityLabel="More options"
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

        {/* Main Action Button */}
        <Button
          title="Learn"
          icon={<Feather name="play" size={20} color="#FFFFFF" />}
          onPress={() => onLearn(brick.id)}
          style={{ alignSelf: "flex-end" }}
        />
      </View>

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
            <Text style={styles.menuItemText}>Edit Brick</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  mainContent: {
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  opacityDim: {
    opacity: 0.6,
  },

  tag: {
    paddingHorizontal: 8,
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
    backgroundColor: "#E6F4EA", // Light success background overlay
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 28,
  },
  learnedText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.secondary5, // Professional Success Green
  },
  boldWeight: {
    fontWeight: "900",
  },
  textContainer: {
    marginBottom: 16,
  },
  targetText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  nativeText: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.7,
    fontWeight: "400",
  },
  learnButton: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  learnButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
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
