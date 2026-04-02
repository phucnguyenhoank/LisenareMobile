import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>

      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 10 }}>
          ✕
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row", // Để nội dung và nút X nằm ngang
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "space-between",
  },
  toastText: {
    color: "#fff",
    maxWidth: "85%", // Tránh chữ đè lên nút X
  },
  closeButton: {
    padding: 5,
  },
});
