import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../theme/grammar_constants";
import { Question } from "../../types/grammar";
import { HintBox } from "./HintBox";
import { QuestionText } from "./QuestionText";

interface Props {
  question: Question;
  index: number;
  onAnswer: (i: number, v: string, timeSeconds: number) => void;
  submitted: boolean;
}

export const MultiQuestion = memo(({ question, index, onAnswer, submitted }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const correct = question.correct_answer;

  const handleSelect = (opt: string) => {
    if (submitted) return;
    setSelected(opt);
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    onAnswer(index, opt, elapsed);
  };

  const getOptState = (opt: string) => {
    if (!submitted) {
      if (selected === opt) return "selected";
      return "idle";
    }
    if (opt === correct) return "correct";
    if (opt === selected && opt !== correct) return "wrong";
    return "idle";
  };

  return (
    <View style={mq.card}>
      {/* Top row: index badge + type badge + hint */}
      <View style={mq.topRow}>
        <View style={mq.indexBadge}>
          <Text style={mq.indexText}>{index + 1}</Text>
        </View>
        <View style={mq.typeBadge}>
          <Text style={mq.typeText}>Trắc nghiệm</Text>
        </View>
        <View style={{ flex: 1 }} />
        <HintBox question_hinted={question} />
      </View>

      <QuestionText text={question.question} />

      {/* Options */}
      <View style={{ gap: 8, marginTop: 4 }}>
        {question.answer.map((opt, i) => {
          const state = getOptState(opt);
          const borderColor =
            state === "selected" ? C.primary
            : state === "correct" ? C.success
            : state === "wrong" ? C.error
            : "#E5E7EB";
          const bg =
            state === "selected" ? C.primaryLight
            : state === "correct" ? C.successLight
            : state === "wrong" ? C.errorLight
            : "#FAFAFA";
          const textColor =
            state === "correct" ? "#15803D"
            : state === "wrong" ? "#DC2626"
            : state === "selected" ? C.primaryDark
            : C.textMid;

          return (
            <Pressable
              key={i}
              onPress={() => handleSelect(opt)}
              disabled={submitted}
              style={[mq.optBtn, { borderColor, backgroundColor: bg }]}
              android_ripple={{ color: C.primaryLight }}
            >
              <View style={[mq.radio, { borderColor }]}>
                {(state === "selected" || state === "correct") && (
                  <View style={[mq.radioDot, { backgroundColor: state === "correct" ? C.success : C.primary }]} />
                )}
              </View>
              <Text style={[mq.optText, { color: textColor }]}>{opt}</Text>
              {state === "correct" && (
                <Feather name="check-circle" size={16} color={C.success} />
              )}
              {state === "wrong" && (
                <Feather name="x-circle" size={16} color={C.error} />
              )}
            </Pressable>
          );
        })}
      </View>

      {submitted && selected !== correct && (
        <View style={mq.hintRow}>
          <Ionicons name="checkmark-circle" size={14} color="#15803D" />
          <Text style={mq.hintLabel}>Đáp án đúng: </Text>
          <Text style={mq.hintVal}>{correct}</Text>
        </View>
      )}
    </View>
  );
});

const mq = StyleSheet.create({
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
    backgroundColor: C.primaryLight,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
  },
  optBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optText: { flex: 1, fontSize: 14, lineHeight: 20 },
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
  hintVal: { fontSize: 13, fontWeight: "700", color: "#15803D", flexShrink: 1 },
});
