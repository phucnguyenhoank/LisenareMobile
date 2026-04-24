import { memo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Question } from "../../types/grammar";
import { QuestionText } from "./QuestionText";
interface Props {
  question: Question;
  index: number;
  onAnswer: (i: number, v: string) => void;
  submitted: boolean;
}

export const MultiQuestion = memo(({ question, index, onAnswer, submitted }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = question.correct_answer;

  const handleSelect = (opt: string) => {
    if (submitted) return;
    setSelected(opt);
    onAnswer(index, opt);
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
      <View style={S.qTop}>
        <View style={S.qNum}>
          <Text style={S.qNumText}>{index + 1}</Text>
        </View>
        <View style={[S.badge, { backgroundColor: C.primaryLight }]}>
          <Text style={[S.badgeText, { color: C.primary }]}>Trắc nghiệm</Text>
        </View>
      </View>

      <QuestionText text={question.question} />

      <View style={{ gap: 8 }}>
        {question.answer.map((opt, i) => {
          const st = getStyle(opt);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelect(opt)}
              disabled={submitted}
              style={[S.optBtn, { borderColor: st.border, backgroundColor: st.bg }]}
              activeOpacity={0.7}
            >
              <View style={[S.optLetter, { backgroundColor: st.border }]}>
                <Text style={S.optLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={[S.optText, { color: st.text }]}>{opt}</Text>
              {submitted && opt === correct && (
                <Text style={{ color: C.success, marginLeft: "auto" }}>✓</Text>
              )}
              {submitted && opt === selected && opt !== correct && (
                <Text style={{ color: C.error, marginLeft: "auto" }}>✗</Text>
              )}
            </TouchableOpacity>
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