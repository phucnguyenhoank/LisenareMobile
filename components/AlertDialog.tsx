import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import Button from "@/components/Button";
import { useDialogStore } from "@/stores/dialog-store";
import colors from "@/theme/colors";

export default function AlertDialog() {
  const {
    visible,
    title,
    message,
    confirmText,
    cancelText,
    showCancel,
    onConfirm,
    onCancel,
    hideDialog,
  } = useDialogStore();

  const handleClose = () => {
    hideDialog();
  };

  const handleConfirm = () => {
    hideDialog();
    onConfirm?.();
  };

  const handleCancel = () => {
    hideDialog();
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {showCancel && (
              <Button
                title={cancelText || "Cancel"}
                onPress={handleCancel}
                variant="outline"
              />
            )}

            <Button title={confirmText || "OK"} onPress={handleConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",

    justifyContent: "center",
    alignItems: "center",

    padding: 24,
  },

  dialog: {
    width: "100%",
    maxWidth: 400,

    backgroundColor: colors.background,

    borderRadius: 20,

    padding: 20,
    gap: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});
