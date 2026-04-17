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

export default function FeedFooter({
  isHelpful,
  onToggleHelpful,
  onAdd,
  isAdding,
}: {
  isHelpful: boolean;
  onToggleHelpful: () => void;
  onAdd: () => void;
  isAdding: boolean;
}) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerAction} onPress={onToggleHelpful}>
        <FontAwesome
          name={isHelpful ? "thumbs-up" : "thumbs-o-up"}
          size={20}
          color={isHelpful ? colors.secondary : "#777"}
        />
        <Text
          style={[styles.actionText, isHelpful && styles.helpfulTextActive]}
        >
          Useful
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.footerAction,
          styles.primaryButton,
          isAdding && styles.disabledButton,
        ]}
        onPress={onAdd}
        disabled={isAdding}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <FontAwesome6 name="add" size={16} color="#fff" />
            <Text style={styles.primaryText}>Add</Text>
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
    gap: 8,
  },

  footerAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
  },

  helpfulTextActive: {
    color: colors.secondary,
    fontWeight: "600",
  },

  actionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "500",
    color: "#777",
  },

  primaryButton: {
    backgroundColor: colors.secondary2,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "600",
  },
});
