import Feather from "@expo/vector-icons/Feather";
import { request } from "@/services/client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { QuizContext } from "../../context/QuizContext";
import { C, isMultiChoice, normalize } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Exercise, Question } from "../../types/grammar";
import { ChatButton } from "./ChatBot";
import { FillQuestion } from "./Fillquestion";
import { MultiQuestion } from "./Multiquestion";

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

type AnswerRecord = {
  question_id: number;
  user_answer: string;
  time_seconds: number;
};

export const QuizScreen = memo(({ exercise, onBack }: Props) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, AnswerRecord>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const questionStartTimes = useRef<Record<number, number>>({});

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    questionStartTimes.current = {};
    try {
      const data = await request<Question[]>(
        `/grammar/questions/${exercise.id}`,
      );
      setQuestions(data);
      data.forEach((_, i) => {
        questionStartTimes.current[i] = Date.now();
      });
    } catch (e: any) {
      setError(e?.message ?? "Không tải được câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [exercise.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswer = useCallback(
    (index: number, value: string) => {
      const startTime = questionStartTimes.current[index] ?? Date.now();
      const timeSeconds = Math.round((Date.now() - startTime) / 1000);
      setAnswers((prev) => ({
        ...prev,
        [index]: {
          question_id: questions[index]?.question_id,
          user_answer: value,
          time_seconds: timeSeconds,
        },
      }));
    },
    [questions],
  );

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const userAnswer = answers[i]?.user_answer ?? "";
      if (isMultiChoice(q)) {
        if (userAnswer === q.correct_answer) correct++;
      } else {
        if (normalize(userAnswer) === normalize(q.correct_answer)) correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);

    try {
      const user = await request<{ id: number }>("/learners/me");
      const payload = {
        user_id: user.id,
        exercise_id: exercise.id,
        submitted_at: new Date().toISOString(),
        answers: Object.values(answers),
      };
      await request("/grammar/submit", {
        method: "POST",
        body: payload,
      });
    } catch (e) {
      console.error("Submit failed:", e);
    }
  };

  const allAnswered = useMemo(
    () =>
      questions.every(
        (_, i) =>
          answers[i]?.user_answer !== undefined &&
          answers[i]?.user_answer !== "",
      ),
    [questions, answers],
  );

  const unanswered = useMemo(
    () =>
      questions.filter(
        (_, i) => !answers[i]?.user_answer || answers[i]?.user_answer === "",
      ).length,
    [questions, answers],
  );

  const pct =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const wrong = questions.length - score;
  const msg =
    pct >= 80
      ? "Xuất sắc!"
      : pct >= 50
        ? "Khá tốt! Cố lên nhé"
        : "Cần ôn thêm rồi!";

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
        <Feather name="alert-triangle" size={36} color={C.error} />
        <Text style={S.softText}>{error}</Text>
        <Pressable style={S.btn} onPress={fetchQuestions} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
          <Text style={S.btnText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <QuizContext.Provider value={{ exercise, questions, answers }}>
      <View style={S.fill}>
        {/* Header */}
        <View style={S.header}>
          <Pressable onPress={onBack} style={S.backBtn}>
            <Feather name="arrow-left" size={20} color={C.textMid} />
          </Pressable>
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
                  <View style={S.resultStatRow}>
                    <View style={[S.resultStatItem, { backgroundColor: C.successLight }]}>
                      <Feather name="check-circle" size={13} color={C.success} />
                      <Text style={[S.resultStatText, { color: "#15803D" }]}>{score}</Text>
                    </View>
                    <View style={[S.resultStatItem, { backgroundColor: C.errorLight }]}>
                      <Feather name="x-circle" size={13} color={C.error} />
                      <Text style={[S.resultStatText, { color: "#DC2626" }]}>{wrong}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Pressable style={S.btn} onPress={fetchQuestions} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
                  <Text style={S.btnText}>Làm lại</Text>
                </Pressable>
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
              ),
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
              <Pressable
                style={[S.submitBtn, !allAnswered && { opacity: 0.45 }]}
                onPress={handleSubmit}
                disabled={!allAnswered}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <Text style={S.submitBtnText}>Nộp bài</Text>
              </Pressable>
            </View>
          )}
        </KeyboardAwareScrollView>

        <ChatButton
          exercise={exercise}
          questions={questions}
          answers={answers}
        />
      </View>
    </QuizContext.Provider>
  );
});
