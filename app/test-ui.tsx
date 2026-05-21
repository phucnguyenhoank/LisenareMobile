import { StyleSheet, Text, View } from "react-native";
import colors from "@/theme/colors";
import { request } from "@/services/client";
import Button from "@/components/Button";
import { handleRequestError } from "@/utils/handle-request-error";
import { showDialog } from "@/utils/dialogs";

export default function TestScreen() {
  const handleDelete = async () => {
    try {
      await request("/test");
    } catch (err) {
      handleRequestError(err);
    }
  };

  const handlePress = async () => {
    showDialog({
      title: "Delete brick?",
      message: "This action cannot be undone.",

      confirmText: "Delete",
      cancelText: "Cancel",

      showCancel: true,

      onConfirm: () => {
        handleDelete();
      },
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Click here" onPress={handlePress} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    alignSelf: "center",
  },
});
