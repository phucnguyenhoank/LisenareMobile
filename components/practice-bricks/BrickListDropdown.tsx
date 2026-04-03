import { SimpleBrick } from "@/types/brick";
import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  bricks: SimpleBrick[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export function BrickListDropdown({ bricks, onEdit, onDelete }: Props) {
  if (bricks.length === 0) {
    return (
      <View style={styles.dropdown}>
        <Text style={styles.emptyText}>No pending bricks</Text>
      </View>
    );
  }

  return (
    <View style={styles.dropdown}>
      {bricks.map((b) => (
        <View key={b.id} style={styles.brickRow}>
          <Text style={styles.brickText} numberOfLines={1}>
            {b.target_text}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit(b.id)}
              style={styles.iconBtn}
            >
              <Entypo name="pencil" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDelete(b.id)}
              style={styles.iconBtn}
            >
              <Entypo name="trash" size={16} color="#FF5252" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#F9F9F9",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  brickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  brickText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    paddingVertical: 4,
  },
  actions: {
    flexDirection: "row",
  },
  iconBtn: {
    padding: 6,
    marginLeft: 6,
  },
});
