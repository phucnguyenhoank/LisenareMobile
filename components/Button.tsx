import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native";
import colors from "@/theme/colors";

interface ButtonProps {
  title?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "outline";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export default function Button({
  title,
  icon,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const hasText = !!title;
  const hasIcon = !!icon;

  // Determine standard colors based on variant
  const textColor = isPrimary ? "white" : colors.secondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        isPrimary ? styles.primary : styles.outline,
        // Adjust padding if it is an icon-only button
        hasIcon && !hasText && styles.iconOnlyPadding,
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.7 },
        style,
      ]}
    >
      {hasIcon && icon}

      {hasText && (
        <Text
          style={[
            styles.text,
            { color: textColor },
            hasIcon && styles.marginLeft,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start", // Prevents button from stretching to 100% width by default
  },
  iconOnlyPadding: {
    paddingHorizontal: 12, // Square-like padding for icon-only buttons
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
  marginLeft: {
    marginLeft: 8,
  },
  disabled: {
    backgroundColor: "#D3D3D3",
    borderColor: "#A9A9A9",
    opacity: 0.6,
  },
  disabledText: {
    color: "#8E8E8E",
  },
});
