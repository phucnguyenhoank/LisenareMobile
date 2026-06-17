import Feather from "@expo/vector-icons/Feather";
import { memo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
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

  const getStyle = (opt: string) => {
    if (!submitted) {
      return selected === opt
        ? { border: C.primary, bg: C.primaryLight, text: C.primaryDark }
        : { border: C.border, bg: "#FAFAFA", text: C.textMid };
    }
    if (opt === correct)
      return { border: C.success, bg: C.successLight, text: "#15803D" };
    if (opt === selected && opt !== correct)
      return { border: C.error, bg: C.errorLight, text: "#DC2626" };
    return { border: C.border, bg: "#FAFAFA", text: C.textMid };
  };

  return (
    <View style={S.qCard}>
      <View style={[S.qTop, { justifyContent: "space-between" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={S.qNum}>
            <Text style={S.qNumText}>{index + 1}</Text>
          </View>
          <View style={[S.badge, { backgroundColor: C.primaryLight }]}>
            <Text style={[S.badgeText, { color: C.primary }]}>Trắc nghiệm</Text>
          </View>
        </View>

        <HintBox question_hinted={question} />
      </View>

      <QuestionText text={question.question} />

      <View style={{ gap: 8 }}>
        {question.answer.map((opt, i) => {
          const st = getStyle(opt);
          return (
            <Pressable
              key={i}
              onPress={() => handleSelect(opt)}
              disabled={submitted}
              style={[S.optBtn, { borderColor: st.border, backgroundColor: st.bg }]}
              android_ripple={{ color: C.primaryLight }}
            >
              <View style={[S.optLetter, { backgroundColor: st.border }]}>
                <Text style={S.optLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={[S.optText, { color: st.text }]}>{opt}</Text>
              {submitted && opt === correct && (
                <Feather name="check-circle" size={16} color={C.success} style={{ marginLeft: "auto" as any }} />
              )}
              {submitted && opt === selected && opt !== correct && (
                <Feather name="x-circle" size={16} color={C.error} style={{ marginLeft: "auto" as any }} />
              )}
            </Pressable>
          );
        })}
      </View>

      {submitted && selected !== correct && (
        <View style={S.hint}>
          <Text style={S.hintLabel}>Đáp án đúng: </Text>
          <Text style={S.hintVal}>{correct}</Text>
        </View>
      )}
    </View>
  );
});
