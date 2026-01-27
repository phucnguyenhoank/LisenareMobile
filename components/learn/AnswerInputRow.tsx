import colors from "@/theme/colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type Props = {
  answer: string;
  setAnswer: (v: string) => void;
  submitting: boolean;
  isRecording: boolean;
  onMicPress: () => void;
  onSubmit: () => void;
};

export function AnswerInputRow({
  answer,
  setAnswer,
  submitting,
  isRecording,
  onMicPress,
  onSubmit,
}: Props) {
  return (
    <View style={styles.answerRow}>
      <Pressable style={styles.micIcon} onPress={onMicPress}>
        {isRecording ? (
          <FontAwesome name="trash-o" size={24} color="red" />
        ) : (
          <FontAwesome name="microphone" size={32} color={colors.secondary2} />
        )}
      </Pressable>

      <TextInput
        value={answer}
        onChangeText={setAnswer}
        placeholder="Nhập những gì bạn hiểu"
        placeholderTextColor={"#9c9c9cff"}
        style={styles.compactInput}
        editable={!submitting}
        returnKeyType="send"
        onSubmitEditing={onSubmit}
        multiline
      />

      <Pressable hitSlop={10} onPress={onSubmit}>
        <FontAwesome5 name="arrow-up" size={24} color={colors.secondary2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 20,
    width: "85%",
  },
  micIcon: {
    marginRight: 8,
  },
  compactInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },
});
