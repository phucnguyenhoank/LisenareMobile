import { request } from "@/api/client";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: number;
  name: string;
}

interface Lesson {
  id: number;
  name: string;
  exercises: Exercise[];
}

interface Topic {
  id: number;
  name: string;
  lessons: Lesson[];
}

interface Question {
  question: string;
  answer: string[];
  correct_answer: string;
}

type Screen =
  | { type: "topics" }
  | { type: "lessons"; topic: Topic }
  | { type: "exercises"; lesson: Lesson }
  | { type: "quiz"; exercise: Exercise };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isMultiChoice = (q: Question) =>
  Array.isArray(q.answer) && q.answer.length > 1;

const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ");

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  bg: "#F4F6FB",
  white: "#FFFFFF",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  success: "#22C55E",
  successLight: "#F0FDF4",
  error: "#EF4444",
  errorLight: "#FFF1F2",
  text: "#111827",
  textMid: "#374151",
  textSoft: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  badge: "#FEF3C7",
  badgeText: "#92400E",
};

// ─── QuestionText — renders blanks ────────────────────────────────────────────

function QuestionText({ text }: { text: string }) {
  const parts = text.split(/([….]{2,})/g);
  return (
    <Text style={S.qText}>
      {parts.map((part, i) =>
        /^[….]{2,}$/.test(part) ? (
          <Text key={i} style={S.blank}>
            {"  ______  "}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

// ─── FillQuestion ─────────────────────────────────────────────────────────────

function FillQuestion({
  question,
  index,
  onAnswer,
  submitted,
}: {
  question: Question;
  index: number;
  onAnswer: (i: number, v: string) => void;
  submitted: boolean;
}) {
  const [value, setValue] = useState("");
  const correct = question.correct_answer;
  const isCorrect =
    submitted && normalize(value) === normalize(correct);
  const isWrong = submitted && !isCorrect;

  const borderColor = !submitted
    ? C.border
    : isCorrect
    ? C.success
    : C.error;
  const bgColor = !submitted
    ? C.white
    : isCorrect
    ? C.successLight
    : C.errorLight;
  const textColor = !submitted ? C.text : isCorrect ? "#15803D" : "#DC2626";

  return (
    <View style={S.qCard}>
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

// ─── MultiQuestion ────────────────────────────────────────────────────────────

function MultiQuestion({
  question,
  index,
  onAnswer,
  submitted,
}: {
  question: Question;
  index: number;
  onAnswer: (i: number, v: string) => void;
  submitted: boolean;
}) {
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
              style={[
                S.optBtn,
                { borderColor: st.border, backgroundColor: st.bg },
              ]}
              activeOpacity={0.7}
            >
              <View style={[S.optLetter, { backgroundColor: st.border }]}>
                <Text style={S.optLetterText}>
                  {String.fromCharCode(65 + i)}
                </Text>
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
}

// ─── QuizScreen ───────────────────────────────────────────────────────────────

function QuizScreen({
  exercise,
  onBack,
}: {
  exercise: Exercise;
  onBack: () => void;
}) {
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
        if (normalize(answers[i] ?? "") === normalize(q.correct_answer))
          correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  const allAnswered = questions.every(
    (_, i) => answers[i] !== undefined && answers[i] !== ""
  );
  const unanswered = questions.filter(
    (_, i) => !answers[i] || answers[i] === ""
  ).length;
  const pct =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
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
    <KeyboardAvoidingView
      style={S.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── ExerciseListScreen ───────────────────────────────────────────────────────

function ExerciseListScreen({
  lesson,
  onSelect,
  onBack,
}: {
  lesson: Lesson;
  onSelect: (e: Exercise) => void;
  onBack: () => void;
}) {
  return (
    <View style={S.fill}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={onBack}>
          <Text style={S.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle} numberOfLines={2}>
            {lesson.name}
          </Text>
        </View>
      </View>
      <FlatList
        data={lesson.exercises}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={S.listCard}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
          >
            <View style={S.listIcon}>
              <Text style={{ fontSize: 18 }}>📝</Text>
            </View>
            <Text style={S.listCardText}>{item.name}</Text>
            <Text style={{ color: C.textLight, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── LessonListScreen ─────────────────────────────────────────────────────────

function LessonListScreen({
  topic,
  onSelect,
  onBack,
}: {
  topic: Topic;
  onSelect: (l: Lesson) => void;
  onBack: () => void;
}) {
  return (
    <View style={S.fill}>
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={onBack}>
          <Text style={S.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle} numberOfLines={2}>
            {topic.name}
          </Text>
        </View>
      </View>
      <FlatList
        data={topic.lessons}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={S.listCard}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
          >
            <View style={S.listIcon}>
              <Text style={{ fontSize: 18 }}>📖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.listCardText}>{item.name}</Text>
              <Text style={S.listCardSub}>
                {item.exercises.length} bài tập
              </Text>
            </View>
            <Text style={{ color: C.textLight, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── TopicListScreen ──────────────────────────────────────────────────────────

function TopicListScreen({
  topics,
  loading,
  error,
  onSelect,
  onRetry,
}: {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  onSelect: (t: Topic) => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View style={[S.fill, S.center]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={[S.softText, { marginTop: 12 }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[S.fill, S.center]}>
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={S.softText}>{error}</Text>
        <TouchableOpacity style={S.btn} onPress={onRetry}>
          <Text style={S.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={S.fill}>
      <View style={[S.header, { paddingVertical: 16 }]}>
        <View>
          <Text style={[S.headerTitle, { fontSize: 20 }]}>Ngữ pháp</Text>
          <Text style={S.headerSub}>{topics.length} chuyên đề</Text>
        </View>
      </View>
      <FlatList
        data={topics}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={S.topicCard}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
          >
            <View style={S.topicIndex}>
              <Text style={S.topicIndexText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.topicName}>{item.name}</Text>
              <Text style={S.topicSub}>
                {item.lessons.length} bài học •{" "}
                {item.lessons.reduce((s, l) => s + l.exercises.length, 0)} bài tập
              </Text>
            </View>
            <Text style={{ color: C.textLight, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Root: GrammarStudying ────────────────────────────────────────────────────

export default function GrammarStudying() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ type: "topics" });

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request<Topic[]>("/grammar/topics");
      setTopics(data);
    } catch (e: any) {
      setError(e?.message ?? "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  if (screen.type === "topics") {
    return (
      <View style={S.fill}>
        <TopicListScreen
          topics={topics}
          loading={loading}
          error={error}
          onSelect={(t) => setScreen({ type: "lessons", topic: t })}
          onRetry={fetchTopics}
        />
      </View>
    );
  }

  if (screen.type === "lessons") {
    return (
      <LessonListScreen
        topic={screen.topic}
        onSelect={(l) => setScreen({ type: "exercises", lesson: l })}
        onBack={() => setScreen({ type: "topics" })}
      />
    );
  }

  if (screen.type === "exercises") {
    return (
      <ExerciseListScreen
        lesson={screen.lesson}
        onSelect={(e) => setScreen({ type: "quiz", exercise: e })}
        onBack={() =>
          setScreen({ type: "lessons", topic: screen.lesson as any })
        }
      />
    );
  }

  if (screen.type === "quiz") {
    return (
      <QuizScreen
        exercise={screen.exercise}
        onBack={() => {
          // Go back to exercise list - we need the parent lesson
          // Find the lesson that has this exercise
          const parentLesson = topics
            .flatMap((t) => t.lessons)
            .find((l) => l.exercises.some((e) => e.id === screen.exercise.id));
          if (parentLesson) {
            setScreen({ type: "exercises", lesson: parentLesson });
          } else {
            setScreen({ type: "topics" });
          }
        }}
      />
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  center: { justifyContent: "center", alignItems: "center", gap: 10 },
  softText: { color: C.textSoft, fontSize: 14 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  backBtnText: { color: C.textMid, fontSize: 13, fontWeight: "600" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  headerSub: { fontSize: 12, color: C.textLight, marginTop: 2 },

  // Topic list
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  topicIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  topicIndexText: { color: C.primary, fontWeight: "700", fontSize: 13 },
  topicName: { fontSize: 14, fontWeight: "600", color: C.text, flex: 1 },
  topicSub: { fontSize: 12, color: C.textSoft, marginTop: 2 },

  // List card (lessons / exercises)
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  listCardText: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text },
  listCardSub: { fontSize: 12, color: C.textSoft, marginTop: 2 },

  // Question card
  qCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  qTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  qNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  qNumText: { color: C.primary, fontSize: 11, fontWeight: "700" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: C.badge,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: C.badgeText },
  qText: { fontSize: 15, color: C.text, lineHeight: 22, marginBottom: 12 },
  blank: { color: C.primary, fontWeight: "700" },

  // Fill input
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
  },

  // Multi choice
  optBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  optLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optLetterText: { color: C.white, fontSize: 11, fontWeight: "700" },
  optText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Hint
  hint: {
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

  // Result bar
  resultBar: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
    gap: 12,
  },
  resultLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultScore: { fontSize: 36 },
  resultNum: { fontSize: 36, fontWeight: "800", color: C.primary },
  resultDenom: { fontSize: 18, color: C.textLight },
  resultMsg: { fontSize: 14, fontWeight: "600", color: C.text },
  resultPct: { fontSize: 12, color: C.textSoft, marginTop: 2 },

  // Submit
  submitWrap: {
    alignItems: "center",
    marginTop: 8,
    gap: 10,
  },
  submitHint: { fontSize: 13, color: C.textSoft },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  submitBtnText: { color: C.white, fontSize: 15, fontWeight: "700" },

  // Buttons
  btn: {
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  btnText: { color: C.white, fontSize: 13, fontWeight: "600" },
  btnOutline: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: C.white,
  },
  btnOutlineText: { color: C.textMid, fontSize: 13, fontWeight: "600" },
});