import Feather from "@expo/vector-icons/Feather";
import { request } from "@/services/client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
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
    (index: number, value: string, timeSeconds?: number) => {
      const elapsed = timeSeconds ?? Math.round((Date.now() - (questionStartTimes.current[index] ?? Date.now())) / 1000);
      setAnswers((prev) => ({
        ...prev,
        [index]: {
          question_id: questions[index]?.question_id,
          user_answer: value,
          time_seconds: elapsed,
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

  const answeredCount = useMemo(
    () =>
      questions.filter(
        (_, i) => answers[i]?.user_answer !== undefined && answers[i]?.user_answer !== "",
      ).length,
    [questions, answers],
  );

  const allAnswered = answeredCount === questions.length && questions.length > 0;

  const unanswered = questions.length - answeredCount;

  const progressPct =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

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
        <View style={qs.header}>
          <Pressable onPress={onBack} style={qs.backBtn} hitSlop={8}>
            <Feather name="arrow-left" size={20} color={C.textMid} />
          </Pressable>
          <View style={qs.headerIcon}>
            <Feather name="book-open" size={18} color={C.primary} />
          </View>
          <Text style={qs.headerTitle} numberOfLines={2}>
            {exercise.name}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={qs.progressWrap}>
          <Text style={qs.progressLabel}>
            Câu {answeredCount}/{questions.length}
          </Text>
          <View style={qs.progressTrack}>
            <View style={[qs.progressFill, { width: `${progressPct}%` }]} />
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

const qs = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    lineHeight: 20,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textMid,
    minWidth: 60,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: C.progressBg,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 3,
  },
});
