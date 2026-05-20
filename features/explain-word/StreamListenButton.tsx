import React from "react";
import { TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import colors from "@/theme/colors";
import { useTTSPlayer } from "@/hooks/useTTSPlayer";

interface Props {
  text: string;
  size?: number;
}

export default function StreamListenButton({ text, size = 20 }: Props) {
  const { play, ready, player } = useTTSPlayer(text);

  const loading = !ready;

  return (
    <TouchableOpacity onPress={play} disabled={loading} style={styles.button}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.secondary} />
      ) : (
        <Ionicons
          name={player.playing ? "volume-high" : "volume-medium-outline"}
          size={size}
          color={colors.secondary}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.buttonBackground,
    alignItems: "center",
    justifyContent: "center",
  },
});
