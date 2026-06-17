import { request } from "@/services/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { Href, Link, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AdaptivePracticeView } from "../../components/adaptive-practice/AdaptivePracticeView";
import { ExerciseListScreen } from "../../components/grammar/Exerciselistscreen";
import { LessonListScreen } from "../../components/grammar/Lessonlistscreen";
import { QuizScreen } from "../../components/grammar/Quizscreen";
import { TopicListScreen } from "../../components/grammar/Topiclistscreen";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Screen, Topic } from "../../types/grammar";

const OVERALL_PROGRESS = 42;

function GrammarHomeScreen({
  topics,
  loading,
  error,
  onSelectTopic,
  onAdaptive,
  onAgent,
  onRetry,
}: {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  onSelectTopic: (t: Topic) => void;
  onAdaptive: () => void;
  onAgent: () => void;
  onRetry: () => void;
}) {
  return (
    <ScrollView
      style={ls.fill}
      contentContainerStyle={ls.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={ls.headerSection}>
        <View style={ls.headerLeft}>
          <Text style={ls.headerTitle}>Grammar</Text>
          <Text style={ls.headerSub}>Học ngữ pháp tiếng Anh theo lộ trình</Text>

          <View style={ls.progressSection}>
            <View style={ls.progressLabelRow}>
              <Text style={ls.progressLabel}>Tiến độ tổng thể</Text>
              <Text style={ls.progressPct}>{OVERALL_PROGRESS}%</Text>
            </View>
            <View style={ls.progressTrack}>
              <View style={[ls.progressFill, { width: `${OVERALL_PROGRESS}%` }]} />
            </View>
          </View>
        </View>

        {/* Illustration placeholder */}
        <View style={ls.illustrationBox}>
          <View style={ls.illustrationInner}>
            <Feather name="book-open" size={40} color={C.primary} />
            <View style={ls.illustrationBadge}>
              <Text style={ls.illustrationBadgeText}>✓</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Quick Actions ── */}
      <View style={ls.quickRow}>
        {/* Luyện tập thích ứng */}
        <TouchableOpacity style={ls.quickCardGreen} onPress={onAdaptive} activeOpacity={0.8}>
          <View style={ls.quickIconCircle}>
            <Feather name="cpu" size={28} color={C.white} />
          </View>
          <View style={ls.quickTextBlock}>
            <Text style={ls.quickTitleGreen}>Luyện tập{"\n"}thích ứng</Text>
            <Text style={ls.quickSubGreen}>Ôn tập cá nhân hóa{"\n"}theo năng lực của bạn</Text>
          </View>
          <View style={ls.quickArrowGreen}>
            <Feather name="arrow-right" size={14} color={C.primary} />
          </View>
        </TouchableOpacity>

        {/* Học cùng AI */}
        <TouchableOpacity style={ls.quickCardWhite} onPress={onAgent} activeOpacity={0.8}>
          <View style={ls.quickAIIconCircle}>
            <Text style={{ fontSize: 26 }}>🤖</Text>
          </View>
          <View style={ls.quickTextBlock}>
            <Text style={ls.quickTitleAI}>Học cùng AI</Text>
            <Text style={ls.quickSubAI}>Đặt câu hỏi, giải thích{"\n"}ngữ pháp dễ hiểu</Text>
          </View>
          <View style={ls.quickArrowAI}>
            <Feather name="arrow-right" size={14} color={C.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Topic list header ── */}
      <View style={ls.sectionHeader}>
        <Text style={ls.sectionTitle}>Danh sách chuyên đề</Text>
        <TouchableOpacity style={ls.filterBtn} activeOpacity={0.7}>
          <Feather name="sliders" size={14} color={C.textMid} />
          <Text style={ls.filterText}>Tất cả</Text>
          <Feather name="chevron-down" size={14} color={C.textMid} />
        </TouchableOpacity>
      </View>

      {/* ── Topic list (inline, not scrollable) ── */}
      <View style={ls.topicListContainer}>
        <TopicListScreen
          topics={topics}
          loading={loading}
          error={error}
          onSelect={onSelectTopic}
          onRetry={onRetry}
          inScrollView
        />
      </View>
    </ScrollView>
  );
}

export default function GrammarStudying() {
  const { token, isTokenLoading } = useAuth();
  const router = useRouter();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ type: "topics" });

  const fetchTopics = useCallback(async () => {
    if (!token) return;
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
  }, [token]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const onBack: (() => void) | null =
    screen.type === "lessons"
      ? () => setScreen({ type: "topics" })
      : screen.type === "exercises"
        ? () => setScreen({ type: "lessons", topic: screen.topic })
        : screen.type === "quiz"
          ? () => {
              const parentTopic = topics.find((t) =>
                t.lessons.some((l) =>
                  l.exercises.some((e) => e.id === screen.exercise.id),
                ),
              );
              const parentLesson = parentTopic?.lessons.find((l) =>
                l.exercises.some((e) => e.id === screen.exercise.id),
              );
              if (parentTopic && parentLesson) {
                setScreen({ type: "exercises", lesson: parentLesson, topic: parentTopic });
              } else {
                setScreen({ type: "topics" });
              }
            }
          : screen.type === "adaptive"
            ? () => setScreen({ type: "topics" })
            : null;

  useEffect(() => {
    if (!onBack) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  if (isTokenLoading) {
    return (
      <View style={[S.fill, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}>
        <Link href="/setting" style={{ fontSize: 16, fontWeight: "bold", color: colors.secondary }}>
          Đăng nhập
        </Link>
        <Text style={{ fontSize: 15, color: "#444" }}>để học ngữ pháp</Text>
      </View>
    );
  }

  if (screen.type === "topics") {
    return (
      <GrammarHomeScreen
        topics={topics}
        loading={loading}
        error={error}
        onSelectTopic={(t) => setScreen({ type: "lessons", topic: t })}
        onAdaptive={() => setScreen({ type: "adaptive" })}
        onAgent={() => router.push("/agent-test" as Href)}
        onRetry={fetchTopics}
      />
    );
  }

  if (screen.type === "lessons") {
    return (
      <LessonListScreen
        topic={screen.topic}
        onSelect={(l) => setScreen({ type: "exercises", lesson: l, topic: screen.topic })}
        onBack={onBack!}
      />
    );
  }

  if (screen.type === "exercises") {
    return (
      <ExerciseListScreen
        lesson={screen.lesson}
        onSelect={(e) => setScreen({ type: "quiz", exercise: e })}
        onBack={onBack!}
      />
    );
  }

  if (screen.type === "quiz") {
    return <QuizScreen exercise={screen.exercise} onBack={onBack!} />;
  }

  if (screen.type === "adaptive") {
    return (
      <AdaptivePracticeView
        topics={topics}
        loadingTopics={loading}
        topicError={error}
        onRetry={fetchTopics}
        onExit={() => setScreen({ type: "topics" })}
      />
    );
  }

  return null;
}

const ls = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 32 },

  // Header section
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: C.headerBg,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: C.textSoft,
    marginBottom: 16,
  },
  progressSection: {
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
    color: C.textMid,
    fontWeight: "500",
  },
  progressPct: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: C.progressBg,
    borderRadius: 4,
    overflow: "hidden",
    width: "85%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 4,
  },

  // Illustration
  illustrationBox: {
    width: 90,
    height: 90,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationInner: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  illustrationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // Quick actions
  quickRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: C.bg,
  },
  quickCardGreen: {
    flex: 1,
    backgroundColor: C.primaryLight,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    position: "relative",
  },
  quickCardWhite: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    position: "relative",
  },
  quickIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAIIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTextBlock: {
    gap: 2,
  },
  quickTitleGreen: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    lineHeight: 20,
  },
  quickSubGreen: {
    fontSize: 11,
    color: C.textSoft,
    lineHeight: 16,
  },
  quickTitleAI: {
    fontSize: 15,
    fontWeight: "700",
    color: C.primary,
    lineHeight: 20,
  },
  quickSubAI: {
    fontSize: 11,
    color: C.textSoft,
    lineHeight: 16,
  },
  quickArrowGreen: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primaryMid,
    alignItems: "center",
    justifyContent: "center",
  },
  quickArrowAI: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterText: {
    fontSize: 13,
    color: C.textMid,
    fontWeight: "500",
  },

  // Topic list container (renders inline in ScrollView)
  topicListContainer: {
    flex: 1,
    minHeight: 200,
  },
});
