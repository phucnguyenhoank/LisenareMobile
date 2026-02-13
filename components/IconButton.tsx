import React from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  icon: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ onPress, icon, style }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
