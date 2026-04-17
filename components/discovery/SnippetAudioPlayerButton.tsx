import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import colors from "@/theme/colors";

export default function SnippetAudioPlayerButton({
  isLoading,
  onPress,
}: {
  isLoading: boolean;
  onPress: () => void;
}) {
  if (isLoading) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.audioButton}>
      <Ionicons name="play" size={40} color={colors.secondary2} />
      <Text style={styles.audioText}>Listen</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  audioText: {
    marginLeft: 6,
    color: colors.secondary2,
    fontWeight: "500",
  },
});
