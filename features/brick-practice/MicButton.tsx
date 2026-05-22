import colors from "@/theme/colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

// Define the arguments (Props) the Mic needs
interface MicButtonProps {
  isRecording: boolean;
  onPress: () => void; // To start/stop/send
  onCancel: () => void; // To quit recording
}

export function MicButton({ isRecording, onPress, onCancel }: MicButtonProps) {
  return (
    <View style={styles.container}>
      {/* Main Mic/Send Circle */}
      <Pressable
        style={[styles.micCircle, isRecording && styles.recordingActive]}
        onPress={onPress}
      >
        <FontAwesome
          name={isRecording ? "arrow-up" : "microphone"}
          size={28}
          color="white"
        />
      </Pressable>

      {/* Cancel Button - Only shows when recording */}
      {isRecording && (
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <MaterialIcons name="cancel" size={36} color="red" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  micCircle: {
    backgroundColor: colors.secondary2,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingActive: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  cancelBtn: { marginTop: 20 },
});
