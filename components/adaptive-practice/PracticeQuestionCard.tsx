import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
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
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, [question.id]);

  useEffect(() => {
    if (!feedback || !autoNext) return;
    timerRef.current = setTimeout(() => { onNext(feedback); }, AUTO_NEXT_DELAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [feedback, autoNext, onNext]);

  const submit = async (value: string) => {
    if (!value || submitted || submitting) return;
    const res = await onAnswer(value);
    if (res) setFeedback(res);
  };

  const handleSelectMC = (opt: string) => { if (submitted) return; setSelected(opt); submit(opt); };
  const handleSubmitFill = () => { if (submitted || !fillValue.trim()) return; submit(fillValue.trim()); };
  const handleNextClick = () => { if (feedback) onNext(feedback); };
  const handleSkip = () => { if (feedback) onNext(feedback); };

  const getOptState = (opt: string) => {
    if (!submitted) { return selected === opt ? "selected" : "idle"; }
    if (opt === feedback?.correct_answer) return "correct";
    if (opt === selected && opt !== feedback?.correct_answer) return "wrong";
    return "idle";
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={100}
      enableOnAndroid={true}
    >
      {/* Status row */}
      <View style={pq.statusRow}>
        <View style={pq.statusLeft}>
          <View style={pq.pillGray}>
            <Text style={pq.pillGrayText}>Câu {questionIndex}</Text>
          </View>
          <View style={pq.pillGreen}>
            <Feather name="check" size={12} color={C.success} />
            <Text style={pq.pillGreenText}>{correctCount}</Text>
          </View>
        </View>
      </View>

      {/* Auto-next toggle */}
      <View style={pq.autoRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={pq.autoLabel}>Tự động chuyển câu</Text>
          <Text style={pq.autoSub}>
            {autoNext ? `Tự sang câu kế sau ${AUTO_NEXT_DELAY_MS / 1000}s` : "Bấm 'Câu tiếp' để qua câu mới"}
          </Text>
        </View>
        <Switch
          value={autoNext}
          onValueChange={onToggleAutoNext}
          trackColor={{ true: C.primary, false: "#D1D5DB" }}
          thumbColor="#fff"
        />
      </View>

      {/* Question card */}
      <View style={pq.card}>
        {question.content ? (
          <Text style={pq.contextText}>{question.content}</Text>
        ) : null}
        <Text style={pq.qText}>
          {question.question || "(Không có nội dung câu hỏi)"}
        </Text>

        {/* Options */}
        {multiChoice ? (
          <View style={{ gap: 8, marginTop: 14 }}>
            {options.map((opt, i) => {
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
                <TouchableOpacity
                  key={i}
                  disabled={submitted || submitting}
                  onPress={() => handleSelectMC(opt)}
                  style={[pq.optBtn, { borderColor, backgroundColor: bg }]}
                  activeOpacity={0.75}
                >
                  <View style={[pq.radio, { borderColor }]}>
                    {(state === "selected" || state === "correct") && (
                      <View style={[pq.radioDot, { backgroundColor: state === "correct" ? C.success : C.primary }]} />
                    )}
                  </View>
                  <Text style={[pq.optText, { color: textColor }]}>{opt}</Text>
                  {state === "correct" && <Feather name="check" size={16} color={C.success} />}
                  {state === "wrong" && <Feather name="x" size={16} color={C.error} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={{ marginTop: 14, gap: 10 }}>
            <View style={[pq.fillWrap, submitted && {
              borderColor: feedback?.is_correct ? C.success : C.error,
              backgroundColor: feedback?.is_correct ? C.successLight : C.errorLight,
            }]}>
              <TextInput
                value={fillValue}
                onChangeText={setFillValue}
                placeholder="Nhập đáp án..."
                placeholderTextColor={C.textLight}
                editable={!submitted}
                style={[pq.fillInput, submitted && { color: feedback?.is_correct ? "#15803D" : "#DC2626" }]}
                onSubmitEditing={handleSubmitFill}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {submitted && (
                <View style={{ marginRight: 12 }}>
                  {feedback?.is_correct
                    ? <Feather name="check-circle" size={18} color={C.success} />
                    : <Feather name="x-circle" size={18} color={C.error} />
                  }
                </View>
              )}
            </View>
            {!submitted && (
              <TouchableOpacity
                style={[pq.checkBtn, (!fillValue.trim() || submitting) && { opacity: 0.5 }]}
                disabled={!fillValue.trim() || submitting}
                onPress={handleSubmitFill}
                activeOpacity={0.8}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={pq.checkBtnText}>Kiểm tra</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        )}

        {submitted && !feedback?.is_correct && feedback?.correct_answer != null && (
          <View style={pq.hintRow}>
            <Ionicons name="checkmark-circle" size={14} color="#15803D" />
            <Text style={pq.hintLabel}>Đáp án đúng: </Text>
            <Text style={pq.hintVal}>{feedback.correct_answer}</Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      {!multiChoice && !submitted && (
        <View style={pq.actionRow}>
          <TouchableOpacity style={pq.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={pq.skipBtnText}>Bỏ qua</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[pq.checkBtnLarge, (!fillValue.trim() || submitting) && { opacity: 0.5 }]}
            disabled={!fillValue.trim() || submitting}
            onPress={handleSubmitFill}
            activeOpacity={0.8}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={pq.checkBtnLargeText}>Kiểm tra</Text>}
          </TouchableOpacity>
        </View>
      )}

      {submitted && !autoNext && (
        <TouchableOpacity style={pq.nextBtn} onPress={handleNextClick} activeOpacity={0.8}>
          <Text style={pq.nextBtnText}>
            {feedback?.practice_completed ? "Xem kết quả →" : "Câu tiếp →"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Pagination dots */}
      <View style={pq.dotsRow}>
        {Array.from({ length: Math.min(questionIndex, 8) }).map((_, i) => (
          <View
            key={i}
            style={[pq.dot, i === questionIndex - 1 && pq.dotActive]}
          />
        ))}
      </View>
    </KeyboardAwareScrollView>
  );
}

const pq = StyleSheet.create({
  // Status
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLeft: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pillGray: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  pillGrayText: { fontSize: 13, fontWeight: "600", color: C.textMid },
  pillGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: C.successLight,
  },
  pillGreenText: { fontSize: 13, fontWeight: "600", color: "#15803D" },

  // Auto-next
  autoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  autoLabel: { fontSize: 13, fontWeight: "600", color: C.text },
  autoSub: { fontSize: 11, color: C.textSoft },

  // Card
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
  contextText: {
    fontSize: 13,
    color: C.textSoft,
    fontStyle: "italic",
    marginBottom: 6,
    lineHeight: 18,
  },
  qText: {
    fontSize: 16,
    color: C.text,
    lineHeight: 24,
    fontWeight: "600",
  },

  // Options
  optBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
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
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Fill
  fillWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: "#E5E7EB",
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

  // Hint
  hintRow: {
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

  // Action row (fill, before submit)
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  skipBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  skipBtnText: { fontSize: 14, fontWeight: "600", color: C.textMid },
  checkBtnLarge: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  checkBtnLargeText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Next
  nextBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    backgroundColor: C.primary,
    width: 20,
    borderRadius: 4,
  },
});
