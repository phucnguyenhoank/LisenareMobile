import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import colors from "@/theme/colors";
import { Reaction } from "@/types/snippet";

export default function FeedFooter({
  reaction,
  onReact,
  onAdd,
  isAdding,
}: {
  reaction: Reaction;
  onReact: (r: Reaction) => void;
  onAdd: () => void;
  isAdding: boolean;
}) {
  return (
    <View style={styles.footer}>
      {/* REACTIONS */}
      <View style={styles.reactionGroup}>
        {/* LIKE */}
        <TouchableOpacity
          style={[
            styles.reactionButton,
            reaction === "LIKE" && styles.likeActive,
          ]}
          onPress={() => onReact(reaction === "LIKE" ? null : "LIKE")}
          activeOpacity={0.7}
        >
          <FontAwesome
            name={reaction === "LIKE" ? "thumbs-up" : "thumbs-o-up"}
            size={20}
            color={reaction === "LIKE" ? colors.secondary : "#555"}
          />
          <Text
            style={[
              styles.reactionText,
              reaction === "LIKE" && styles.activeText,
            ]}
          >
            Like
          </Text>
        </TouchableOpacity>

        {/* DISLIKE */}
        <TouchableOpacity
          style={[
            styles.reactionButton,
            reaction === "DISLIKE" && styles.dislikeActive,
          ]}
          onPress={() => onReact(reaction === "DISLIKE" ? null : "DISLIKE")}
          activeOpacity={0.7}
        >
          <FontAwesome
            name={reaction === "DISLIKE" ? "thumbs-down" : "thumbs-o-down"}
            size={20}
            color={reaction === "DISLIKE" ? "#e74c3c" : "#555"}
          />
          <Text
            style={[
              styles.reactionText,
              reaction === "DISLIKE" && styles.dislikeText,
            ]}
          >
            Dislike
          </Text>
        </TouchableOpacity>
      </View>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={[styles.addButton, isAdding && styles.disabledButton]}
        onPress={onAdd}
        disabled={isAdding}
        activeOpacity={0.8}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <FontAwesome6 name="add" size={16} color="#fff" />
            <Text style={styles.addText}>Add</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },

  reactionGroup: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },

  likeActive: {
    backgroundColor: "#e8f5e9",
  },

  dislikeActive: {
    backgroundColor: "#fdecea",
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#eee",
  },
  reactionText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#555",
  },
  activeText: {
    color: colors.secondary,
    fontWeight: "600",
  },

  dislikeText: {
    color: "#e74c3c",
    fontWeight: "600",
  },

  addButton: {
    paddingHorizontal: 16,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 8,
  },

  addText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  disabledButton: {
    opacity: 0.6,
  },
});
