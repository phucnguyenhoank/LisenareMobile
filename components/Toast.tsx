import { useToastStore } from "@/stores/toast-store";
import { StyleSheet, Text, View } from "react-native";

export default function Toast() {
  const { visible, message, type } = useToastStore();
  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        type === "error" && styles.error,
        type === "success" && styles.success,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: 32,
    right: 32,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#27272a",
    zIndex: 9999,
  },

  text: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
  },

  error: {
    backgroundColor: "#e11d48",
  },

  success: {
    backgroundColor: "#059669", // Emerald green
  },
});
