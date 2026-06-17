import Feather from "@expo/vector-icons/Feather";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { C, normalize } from "../../theme/grammar_constants";
import { Question } from "../../types/grammar";
import { HintBox } from "./HintBox";
import { QuestionText } from "./QuestionText";

interface Props {
  question: Question;
  index: number;
  onAnswer: (i: number, v: string, timeSeconds: number) => void;
  submitted: boolean;
}

export function FillQuestion({ question, index, onAnswer, submitted }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const correct = question.correct_answer;
  const isCorrect = submitted && normalize(value) === normalize(correct);
  const isWrong = submitted && !isCorrect;

  const borderColor = !submitted
    ? focused ? C.primary : "#E5E7EB"
    : isCorrect ? C.success : C.error;
  const bgColor = !submitted ? C.white : isCorrect ? C.successLight : C.errorLight;
  const textColor = !submitted ? C.text : isCorrect ? "#15803D" : "#DC2626";

  return (
    <View style={fq.card}>
      <View style={fq.topRow}>
        <View style={fq.indexBadge}>
          <Text style={fq.indexText}>{index + 1}</Text>
        </View>
        <View style={fq.typeBadge}>
          <Text style={fq.typeText}>Điền khuyết</Text>
        </View>
        <View style={{ flex: 1 }} />
        <HintBox question_hinted={question} />
      </View>

      <QuestionText text={question.question} />

      <View style={[fq.inputWrap, { borderColor, backgroundColor: bgColor }]}>
        <TextInput
          style={[fq.input, { color: textColor }]}
          value={value}
          onChangeText={(v) => {
            if (!submitted) {
              setValue(v);
              const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
              onAnswer(index, v, elapsed);
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Nhập đáp án..."
          placeholderTextColor={C.textLight}
          editable={!submitted}
        />
        {submitted && (
          <View style={{ marginRight: 12 }}>
            {isCorrect
              ? <Feather name="check-circle" size={18} color={C.success} />
              : <Feather name="x-circle" size={18} color={C.error} />
            }
          </View>
        )}
      </View>

      {submitted && isWrong && (
        <View style={fq.hintRow}>
          <Text style={fq.hintLabel}>Đáp án đúng: </Text>
          <Text style={fq.hintVal}>{correct}</Text>
        </View>
      )}
    </View>
  );
}

const fq = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: C.successLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 4,
  },
  hintLabel: { fontSize: 12, color: C.textSoft },
  hintVal: { fontSize: 13, fontWeight: "700", color: "#15803D" },
});
