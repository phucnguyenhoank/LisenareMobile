import colors from "@/theme/colors";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>; // Allows custom overrides
};

export function FormField({ label, children, style }: Props) {
  return (
    <View style={[styles.fieldCard, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAEAEF",
    // Adding a default margin since Fields are usually stacked
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary2,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
