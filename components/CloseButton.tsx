import colors from "@/theme/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export default function CloseButton() {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.closeButton,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => router.back()}
    >
      <MaterialIcons name="close" size={32} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 40,
    right: 16,
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
