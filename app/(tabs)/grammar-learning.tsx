import { request } from "@/services/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AdaptivePracticeView } from "../../components/adaptive-practice/AdaptivePracticeView";
import { ExerciseListScreen } from "../../components/grammar/Exerciselistscreen";
import { LessonListScreen } from "../../components/grammar/Lessonlistscreen";
import { QuizScreen } from "../../components/grammar/Quizscreen";
import { TopicListScreen } from "../../components/grammar/Topiclistscreen";
import { C } from "../../theme/grammar_constants";
import { S } from "../../theme/grammar_styles";
import { Screen, Topic } from "../../types/grammar";

export default function GrammarStudying() {
  const { token, isTokenLoading } = useAuth();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false); // ← đổi thành false
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ type: "topics" });

  const fetchTopics = useCallback(async () => {
    if (!token) return; // ← guard
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
  }, [token]); // ← thêm token vào deps

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
                setScreen({
                  type: "exercises",
                  lesson: parentLesson,
                  topic: parentTopic,
                });
              } else {
                setScreen({ type: "topics" });
              }
            }
          : null;

  useEffect(() => {
    if (!onBack) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // ── Guard 1: Đang load token ──────────────────────────────
  if (isTokenLoading) {
    return (
      <View
        style={[S.fill, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  // ── Guard 2: Chưa đăng nhập ───────────────────────────────
  if (!token) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Link
          href="/setting"
          style={{ fontSize: 16, fontWeight: "bold", color: colors.secondary }}
        >
          Đăng nhập
        </Link>
        <Text style={{ fontSize: 15, color: "#444" }}>để học ngữ pháp</Text>
      </View>
    );
  }

  // ── Render bình thường ────────────────────────────────────
  const renderScreen = () => {
    if (screen.type === "topics") {
      return (
        <View style={S.fill}>
          <View style={localStyles.topBar}>
            <TouchableOpacity
              style={localStyles.adaptiveBtn}
              onPress={() => setScreen({ type: "adaptive" })}
              activeOpacity={0.75}
            >
              <Text style={localStyles.adaptiveBtnIcon}>🎯</Text>
              <Text style={localStyles.adaptiveBtnText}>
                Luyện tập thích ứng
              </Text>
            </TouchableOpacity>
          </View>
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
          onSelect={(l) =>
            setScreen({ type: "exercises", lesson: l, topic: screen.topic })
          }
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
  };

  return <View style={S.fill}>{renderScreen()}</View>;
}

const localStyles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: C.bg,
  },
  adaptiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  adaptiveBtnIcon: { fontSize: 14 },
  adaptiveBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
