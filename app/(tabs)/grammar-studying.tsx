import { request } from "@/api/client";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
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
        onBack={() => setScreen({ type: "lessons", topic: screen.lesson as any })}
      />
    );
  }

  if (screen.type === "quiz") {
    return (
      <QuizScreen
        exercise={screen.exercise}
        onBack={() => {
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