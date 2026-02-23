import TextButton from "@/components/TextButton";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; group_name: string }) => void;
};

export default function CreateCollectionModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("my group");

  const handleSubmit = () => {
    onSubmit({ name, group_name: groupName });
    setName("");
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Bộ sưu tập mới</Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập tên bộ sưu tập"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <TextInput
            style={styles.input}
            placeholder="Tùy chọn (my group)"
            value={groupName}
            onChangeText={setGroupName}
          />

          <View style={styles.buttonContainer}>
            <TextButton title="Thoát" variant="outline" onPress={onClose} />
            <TextButton title="Tạo" variant="primary" onPress={handleSubmit} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Dims the background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});
