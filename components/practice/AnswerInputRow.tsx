import colors from "@/theme/colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type Props = {
  answer: string;
  setAnswer: (v: string) => void;
  submitting: boolean;
  isRecording: boolean;
  onMicPress: () => void;
  onSubmit: () => void;
  onQuitRecording: () => void;
};

export function AnswerInputRow({
  answer,
  setAnswer,
  submitting,
  isRecording,
  onMicPress,
  onSubmit,
  onQuitRecording,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          placeholder="Nhập những gì bạn hiểu"
          placeholderTextColor={"#9c9c9cff"}
          style={styles.compactInput}
          editable={!submitting}
          multiline
        />
        <Pressable hitSlop={10} onPress={onSubmit}>
          <FontAwesome5 name="arrow-up" size={20} color={colors.secondary2} />
        </Pressable>
      </View>

      {/* Main Recording/Send Button */}
      <Pressable
        style={[styles.micButton, isRecording && styles.recordingActive]}
        onPress={onMicPress}
      >
        <FontAwesome
          name={isRecording ? "arrow-up" : "microphone"}
          size={28}
          color="white"
        />
      </Pressable>

      {/* Separate Delete Button at the bottom */}
      {isRecording && (
        <Pressable style={styles.deleteButton} onPress={onQuitRecording}>
          <MaterialIcons name="cancel" size={36} color="red" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 12,
    width: "85%",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  compactInput: {
    flex: 1,
    fontSize: 15,
    minHeight: 45,
  },
  micButton: {
    backgroundColor: colors.secondary2,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    // Elevation for Android, Shadow for iOS
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingActive: {
    backgroundColor: colors.primary, // Or any color to show it's active
    transform: [{ scale: 1.1 }],
  },
  deleteButton: {
    marginTop: 20,
    padding: 10,
  },
});
