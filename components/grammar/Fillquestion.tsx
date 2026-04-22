import { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { C, normalize } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Question } from "../../types/grammar";
import { QuestionText } from "./QuestionText";

interface Props {
  question: Question;
  index: number;
  onAnswer: (i: number, v: string) => void;
  submitted: boolean;
}

export function FillQuestion({ question, index, onAnswer, submitted }: Props) {
  const [value, setValue] = useState("");
  const correct = question.correct_answer;
  const isCorrect = submitted && normalize(value) === normalize(correct);
  const isWrong = submitted && !isCorrect;

  const borderColor = !submitted ? C.border : isCorrect ? C.success : C.error;
  const bgColor = !submitted ? C.white : isCorrect ? C.successLight : C.errorLight;
  const textColor = !submitted ? C.text : isCorrect ? "#15803D" : "#DC2626";
  const cardRef = useRef<View>(null);
  return (
    <View 
    ref={cardRef}
    style={S.qCard}>
      <View style={S.qTop}>
        <View style={S.qNum}>
          <Text style={S.qNumText}>{index + 1}</Text>
        </View>
        <View style={S.badge}>
          <Text style={S.badgeText}>Điền khuyết</Text>
        </View>
      </View>

      <QuestionText text={question.question} />

      <View style={[S.inputWrap, { borderColor, backgroundColor: bgColor }]}>
        <TextInput
          style={[S.input, { color: textColor }]}
          value={value}
          onChangeText={(v) => {
            if (!submitted) {
              setValue(v);
              onAnswer(index, v);
            }
          }}
          placeholder="Nhập đáp án..."
          placeholderTextColor={C.textLight}
          editable={!submitted}
        />
        {submitted && (
          <Text style={{ color: isCorrect ? C.success : C.error, fontSize: 18, marginRight: 12 }}>
            {isCorrect ? "✓" : "✗"}
          </Text>
        )}
      </View>

      {submitted && isWrong && (
        <View style={S.hint}>
          <Text style={S.hintLabel}>Đáp án đúng: </Text>
          <Text style={S.hintVal}>{correct}</Text>
        </View>
      )}
    </View>
  );
}