import { request } from "@/api/client";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { C, isMultiChoice, normalize } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Exercise, Question } from "../../types/grammar";
import { FillQuestion } from "./Fillquestion";
import { MultiQuestion } from "./Multiquestion";

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

export function QuizScreen({ exercise, onBack }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    try {
      const data = await request<Question[]>(`/grammar/questions/${exercise.id}`);
      setQuestions(data);
    } catch (e: any) {
      setError(e?.message ?? "Không tải được câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [exercise.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswer = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (isMultiChoice(q)) {
        if (answers[i] === q.correct_answer) correct++;
      } else {
        if (normalize(answers[i] ?? "") === normalize(q.correct_answer)) correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  const allAnswered = questions.every(
    (_, i) => answers[i] !== undefined && answers[i] !== ""
  );
  const unanswered = questions.filter((_, i) => !answers[i] || answers[i] === "").length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const msg =
    pct >= 80 ? "Xuất sắc! 🎉" : pct >= 50 ? "Khá tốt! Cố lên nhé 💪" : "Cần ôn thêm rồi! 📚";

  if (loading) {
    return (
      <View style={[S.fill, S.center]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={[S.softText, { marginTop: 12 }]}>Đang tải câu hỏi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[S.fill, S.center]}>
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={S.softText}>{error}</Text>
        <TouchableOpacity style={S.btn} onPress={fetchQuestions}>
          <Text style={S.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={S.fill}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={onBack}>
          <Text style={S.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={S.headerSub}>{questions.length} câu hỏi</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={100}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        {/* Result bar */}
        {submitted && (
          <View style={S.resultBar}>
            <View style={S.resultLeft}>
              <Text style={S.resultScore}>
                <Text style={S.resultNum}>{score}</Text>
                <Text style={S.resultDenom}>/{questions.length}</Text>
              </Text>
              <View>
                <Text style={S.resultMsg}>{msg}</Text>
                <Text style={S.resultPct}>{pct}% chính xác</Text>
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <TouchableOpacity style={S.btn} onPress={fetchQuestions}>
                <Text style={S.btnText}>Làm lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.btnOutline} onPress={onBack}>
                <Text style={S.btnOutlineText}>← Quay lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Questions */}
        <View style={{ gap: 14 }}>
          {questions.map((q, i) =>
            isMultiChoice(q) ? (
              <MultiQuestion
                key={i}
                question={q}
                index={i}
                onAnswer={handleAnswer}
                submitted={submitted}
              />
            ) : (
              <FillQuestion
                key={i}
                question={q}
                index={i}
                onAnswer={handleAnswer}
                submitted={submitted}
              />
            )
          )}
        </View>

        {/* Submit */}
        {!submitted && questions.length > 0 && (
          <View style={S.submitWrap}>
            <Text style={S.submitHint}>
              {allAnswered
                ? "Đã trả lời tất cả. Sẵn sàng nộp bài!"
                : `Còn ${unanswered} câu chưa trả lời`}
            </Text>
            <TouchableOpacity
              style={[S.submitBtn, !allAnswered && { opacity: 0.45 }]}
              onPress={handleSubmit}
              disabled={!allAnswered}
            >
              <Text style={S.submitBtnText}>Nộp bài</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}