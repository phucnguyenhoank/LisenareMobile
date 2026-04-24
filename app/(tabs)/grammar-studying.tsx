import { request } from "@/api/client";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { ExerciseListScreen } from "../../components/grammar/Exerciselistscreen";
import { LessonListScreen } from "../../components/grammar/Lessonlistscreen";
import { QuizScreen } from "../../components/grammar/Quizscreen";
import { TopicListScreen } from "../../components/grammar/Topiclistscreen";
import { S } from "../../theme/grammar_styles";
import { Screen, Topic } from "../../types/grammar";

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

  const onBack: (() => void) | null =
    screen.type === "lessons"
      ? () => setScreen({ type: "topics" })
      : screen.type === "exercises"
      ? () => setScreen({ type: "lessons", topic: screen.topic })
      : screen.type === "quiz"
      ? () => {
          const parentTopic = topics.find((t) =>
            t.lessons.some((l) =>
              l.exercises.some((e) => e.id === screen.exercise.id)
            )
          );
          const parentLesson = parentTopic?.lessons.find((l) =>
            l.exercises.some((e) => e.id === screen.exercise.id)
          );
          if (parentTopic && parentLesson) {
            setScreen({ type: "exercises", lesson: parentLesson, topic: parentTopic });
          } else {
            setScreen({ type: "topics" });
          }
        }
      : null;

  // Chỉ giữ BackHandler, bỏ swipeGesture
  useEffect(() => {
    if (!onBack) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const renderScreen = () => {
    if (screen.type === "topics") {
      return (
        <TopicListScreen
          topics={topics}
          loading={loading}
          error={error}
          onSelect={(t) => setScreen({ type: "lessons", topic: t })}
          onRetry={fetchTopics}
        />
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
      return (
        <QuizScreen
          exercise={screen.exercise}
          onBack={onBack!}
        />
      );
    }

    return null;
  };

  return (
    <View style={S.fill}>
      {renderScreen()}
    </View>
  );
}