import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { C } from "@/theme/grammar_constants";
import {
  AnswerPracticeResponse,
  PracticeQuestion,
  isPracticeMultiChoice,
  parsePracticeOptions,
} from "@/types/practice";

interface Props {
  question: PracticeQuestion;
  theta: number;
  questionIndex: number;
  correctCount: number;
  submitting: boolean;
  autoNext: boolean;
  onToggleAutoNext: (v: boolean) => void;
  onAnswer: (userAnswer: string) => Promise<AnswerPracticeResponse | null>;
  onNext: (answerRes: AnswerPracticeResponse) => void;
}

const AUTO_NEXT_DELAY_MS = 1500;

export function PracticeQuestionCard({
  question,
  theta,
  questionIndex,
  correctCount,
  submitting,
  autoNext,
  onToggleAutoNext,
  onAnswer,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [feedback, setFeedback] = useState<AnswerPracticeResponse | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const multiChoice = isPracticeMultiChoice(question);
  const options = parsePracticeOptions(question);
  const submitted = feedback !== null;

  useEffect(() => {
    setSelected(null);
    setFillValue("");
    setFeedback(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [question.id]);

  useEffect(() => {
    if (!feedback || !autoNext) return;
    timerRef.current = setTimeout(() => {
      onNext(feedback);
    }, AUTO_NEXT_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [feedback, autoNext, onNext]);

  const submit = async (value: string) => {
    if (!value || submitted || submitting) return;
    const res = await onAnswer(value);
    if (res) setFeedback(res);
  };

  const handleSelectMC = (opt: string) => {
    if (submitted) return;
    setSelected(opt);
    submit(opt);
  };

  const handleSubmitFill = () => {
    if (submitted || !fillValue.trim()) return;
    submit(fillValue.trim());
  };

  const handleNextClick = () => {
    if (feedback) onNext(feedback);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={100}
      enableOnAndroid={true}
    >
      <View style={styles.statusRow}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>Câu {questionIndex}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>✓ {correctCount}</Text>
        </View>
        <View style={[styles.statusPill, styles.thetaPill]}>
          <Text style={styles.thetaText}>θ = {theta.toFixed(2)}</Text>
        </View>
        <View style={[styles.statusPill, styles.diffPill]}>
          <Text style={styles.diffText}>Độ khó {question.difficulty.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.autoRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.autoLabel}>Tự động chuyển câu</Text>
          <Text style={styles.autoSub}>
            {autoNext
              ? `Tự sang câu kế sau ${AUTO_NEXT_DELAY_MS / 1000}s`
              : "Bấm 'Câu tiếp' để qua câu mới"}
          </Text>
        </View>
        <Switch
          value={autoNext}
          onValueChange={onToggleAutoNext}
          trackColor={{ true: C.primary, false: C.border }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.card}>
        {question.content ? (
          <Text style={styles.contentText}>{question.content}</Text>
        ) : null}
        {question.question ? (
          <Text style={styles.qText}>{question.question}</Text>
        ) : null}
        {!question.content && !question.question && (
          <Text style={styles.qText}>(Không có nội dung câu hỏi)</Text>
        )}

        {multiChoice ? (
          <View style={{ gap: 8, marginTop: 12 }}>
            {options.map((opt, i) => {
              const isPicked = selected === opt;
              const isCorrect =
                submitted && feedback?.correct_answer === opt;
              const isWrongPick =
                submitted && isPicked && feedback?.correct_answer !== opt;
              const borderColor = isCorrect
                ? C.success
                : isWrongPick
                  ? C.error
                  : isPicked
                    ? C.primary
                    : C.border;
              const bg = isCorrect
                ? C.successLight
                : isWrongPick
                  ? C.errorLight
                  : isPicked
                    ? C.primaryLight
                    : "#FAFAFA";
              const textColor = isCorrect
                ? "#15803D"
                : isWrongPick
                  ? "#DC2626"
                  : C.textMid;
              return (
                <TouchableOpacity
                  key={i}
                  disabled={submitted || submitting}
                  onPress={() => handleSelectMC(opt)}
                  style={[
                    styles.opt,
                    { borderColor, backgroundColor: bg },
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.optLetter, { backgroundColor: borderColor }]}
                  >
                    <Text style={styles.optLetterText}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text style={[styles.optText, { color: textColor }]}>
                    {opt}
                  </Text>
                  {isCorrect && (
                    <Text style={{ color: C.success, marginLeft: "auto" }}>
                      ✓
                    </Text>
                  )}
                  {isWrongPick && (
                    <Text style={{ color: C.error, marginLeft: "auto" }}>
                      ✗
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            <View
              style={[
                styles.fillWrap,
                submitted && {
                  borderColor: feedback?.is_correct ? C.success : C.error,
                  backgroundColor: feedback?.is_correct
                    ? C.successLight
                    : C.errorLight,
                },
              ]}
            >
              <TextInput
                value={fillValue}
                onChangeText={setFillValue}
                placeholder="Nhập đáp án..."
                placeholderTextColor={C.textLight}
                editable={!submitted}
                style={[
                  styles.fillInput,
                  submitted && {
                    color: feedback?.is_correct ? "#15803D" : "#DC2626",
                  },
                ]}
                onSubmitEditing={handleSubmitFill}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {submitted && (
                <Text
                  style={{
                    color: feedback?.is_correct ? C.success : C.error,
                    fontSize: 18,
                    marginRight: 12,
                  }}
                >
                  {feedback?.is_correct ? "✓" : "✗"}
                </Text>
              )}
            </View>
            {!submitted && (
              <TouchableOpacity
                style={[
                  styles.checkBtn,
                  (!fillValue.trim() || submitting) && { opacity: 0.5 },
                ]}
                disabled={!fillValue.trim() || submitting}
                onPress={handleSubmitFill}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.checkBtnText}>Kiểm tra</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {submitted &&
          !feedback?.is_correct &&
          feedback?.correct_answer != null && (
            <View style={styles.hint}>
              <Text style={styles.hintLabel}>💡 Đáp án đúng: </Text>
              <Text style={styles.hintVal}>{feedback.correct_answer}</Text>
            </View>
          )}
      </View>

      {submitted && !autoNext && (
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNextClick}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {feedback?.practice_completed
              ? "Xem kết quả →"
              : "Câu tiếp →"}
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
  },
  statusPillText: {
    fontSize: 12,
    color: C.primaryDark,
    fontWeight: "600",
  },
  thetaPill: { backgroundColor: "#EEF2FF" },
  thetaText: { fontSize: 12, color: "#4338CA", fontWeight: "600" },
  diffPill: { backgroundColor: "#FEF3C7" },
  diffText: { fontSize: 12, color: "#92400E", fontWeight: "600" },

  autoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  autoLabel: { fontSize: 13, fontWeight: "600", color: C.text },
  autoSub: { fontSize: 11, color: C.textSoft, marginTop: 2 },

  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  contentText: {
    fontSize: 13,
    color: C.textSoft,
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 18,
  },
  qText: {
    fontSize: 16,
    color: C.text,
    lineHeight: 24,
    fontWeight: "500",
  },

  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  optLetter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  optLetterText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  optText: { flex: 1, fontSize: 14, lineHeight: 20 },

  fillWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: C.border,
    backgroundColor: "#FAFAFA",
  },
  fillInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },
  checkBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  checkBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  hint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    backgroundColor: C.successLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 4,
  },
  hintLabel: { fontSize: 12, color: C.textSoft },
  hintVal: { fontSize: 13, fontWeight: "700", color: "#15803D", flexShrink: 1 },

  nextBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
