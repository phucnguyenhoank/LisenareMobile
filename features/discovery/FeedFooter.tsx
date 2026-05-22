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
import Button from "@/components/Button";

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
      <Button
        onPress={onAdd}
        icon={
          isAdding ? (
            <ActivityIndicator />
          ) : (
            <FontAwesome6 name="add" size={16} color="#fff" />
          )
        }
        title="Add"
        style={styles.addButton}
        textStyle={styles.addText}
        disabled={isAdding}
      />
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
    paddingVertical: 8,
    marginLeft: 12,
  },

  addText: {
    fontWeight: "500",
    fontSize: 14,
  },
});
