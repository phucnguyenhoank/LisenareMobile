import { RequestError as ApiError, request } from "@/services/client";
import { PracticeQuestionCard } from "@/components/adaptive-practice/PracticeQuestionCard";
import { PracticeResult } from "@/components/adaptive-practice/PracticeResult";
import { TopicSelector } from "@/components/adaptive-practice/TopicSelector";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/theme/grammar_constants";
import { Topic } from "@/types/grammar";
import {
  AnswerPracticeResponse,
  PracticeQuestion,
  StartPracticeResponse,
} from "@/types/practice";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Phase =
  | { type: "select" }
  | {
      type: "session";
      sessionId: string;
      learnerId: number;
      question: PracticeQuestion;
      theta: number;
      questionIndex: number;
      correctCount: number;
    }
  | {
      type: "result";
      totalAnswered: number;
      correctCount: number;
      finalTheta: number;
    };

export default function AdaptivePracticeScreen() {
  const { token, isTokenLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ type: "select" });
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoNext, setAutoNext] = useState(false);

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const fetchTopics = useCallback(async () => {
    if (!token) return;
    setLoadingTopics(true);
    setTopicError(null);
    try {
      const data = await request<Topic[]>("/grammar/topics");
      setTopics(data);
    } catch (e: any) {
      setTopicError(e?.message ?? "Không tải được danh sách chủ đề");
    } finally {
      setLoadingTopics(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const tryEnd = useCallback(async (sessionId: string, learnerId: number) => {
    try {
      await request("/practice/end", {
        method: "POST",
        body: { session_id: sessionId, learner_id: learnerId },
      });
    } catch {
      // session đã hết hạn hoặc đã được dọn — không cần làm gì
    }
  }, []);

  const handleStart = useCallback(
    async (topicIds: number[]) => {
      if (topicIds.length === 0) return;
      setStarting(true);
      try {
        const me = await request<{ id: number }>("/learners/me");
        const res = await request<StartPracticeResponse>("/practice/start", {
          method: "POST",
          body: { learner_id: me.id, topic_ids: topicIds },
        });
        setPhase({
          type: "session",
          sessionId: res.session_id,
          learnerId: me.id,
          question: res.question,
          theta: res.theta,
          questionIndex: 1,
          correctCount: 0,
        });
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 404) {
          Alert.alert(
            "Chưa có câu hỏi",
            "Các chủ đề bạn chọn chưa có câu hỏi luyện tập (REVIEW). Hãy thử chọn chủ đề khác.",
          );
        } else {
          Alert.alert(
            "Không bắt đầu được",
            e?.message ?? "Có lỗi xảy ra khi bắt đầu phiên luyện tập",
          );
        }
      } finally {
        setStarting(false);
      }
    },
    [],
  );

  const handleAnswer = useCallback(
    async (userAnswer: string): Promise<AnswerPracticeResponse | null> => {
      const current = phaseRef.current;
      if (current.type !== "session" || submitting) return null;
      setSubmitting(true);
      try {
        const res = await request<AnswerPracticeResponse>("/practice/answer", {
          method: "POST",
          body: {
            session_id: current.sessionId,
            learner_id: current.learnerId,
            question_id: current.question.id,
            user_answer: userAnswer,
          },
        });
        return res;
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 410) {
          Alert.alert(
            "Phiên đã hết hạn",
            "Phiên luyện tập đã hết hạn. Hãy bắt đầu lại.",
          );
          setPhase({ type: "select" });
        } else {
          Alert.alert("Lỗi", e?.message ?? "Không gửi được câu trả lời");
        }
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting],
  );

  const handleNext = useCallback(
    (answerRes: AnswerPracticeResponse) => {
      const current = phaseRef.current;
      if (current.type !== "session") return;
      const newCorrect =
        current.correctCount + (answerRes.is_correct ? 1 : 0);

      if (answerRes.practice_completed || !answerRes.next_question) {
        tryEnd(current.sessionId, current.learnerId);
        setPhase({
          type: "result",
          totalAnswered: current.questionIndex,
          correctCount: newCorrect,
          finalTheta: answerRes.theta,
        });
      } else {
        setPhase({
          ...current,
          question: answerRes.next_question,
          theta: answerRes.theta,
          questionIndex: current.questionIndex + 1,
          correctCount: newCorrect,
        });
      }
    },
    [tryEnd],
  );

  const handleExit = useCallback(() => {
    const current = phaseRef.current;
    if (current.type === "session") {
      Alert.alert(
        "Kết thúc luyện tập?",
        "Bạn có chắc muốn thoát phiên luyện tập hiện tại?",
        [
          { text: "Tiếp tục", style: "cancel" },
          {
            text: "Thoát",
            style: "destructive",
            onPress: () => {
              tryEnd(current.sessionId, current.learnerId);
              router.back();
            },
          },
        ],
      );
    } else {
      router.back();
    }
  }, [router, tryEnd]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleExit();
      return true;
    });
    return () => sub.remove();
  }, [handleExit]);

  useEffect(() => {
    return () => {
      const current = phaseRef.current;
      if (current.type === "session") {
        tryEnd(current.sessionId, current.learnerId);
      }
    };
  }, [tryEnd]);

  if (isTokenLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.center}>
        <Link href="/setting" style={styles.loginLink}>
          Đăng nhập
        </Link>
        <Text style={styles.loginSub}>để luyện tập thích ứng</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (phase.type === "select") {
      return (
        <TopicSelector
          topics={topics}
          loading={loadingTopics}
          error={topicError}
          starting={starting}
          onStart={handleStart}
          onRetry={fetchTopics}
        />
      );
    }
    if (phase.type === "session") {
      return (
        <PracticeQuestionCard
          question={phase.question}
          theta={phase.theta}
          questionIndex={phase.questionIndex}
          correctCount={phase.correctCount}
          submitting={submitting}
          autoNext={autoNext}
          onToggleAutoNext={setAutoNext}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      );
    }
    return (
      <PracticeResult
        totalAnswered={phase.totalAnswered}
        correctCount={phase.correctCount}
        finalTheta={phase.finalTheta}
        onRestart={() => setPhase({ type: "select" })}
        onExit={() => router.back()}
      />
    );
  };

  const subtitle =
    phase.type === "select"
      ? "Chọn chủ đề"
      : phase.type === "session"
        ? `Câu ${phase.questionIndex}`
        : "Kết quả";

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={handleExit}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Luyện tập thích ứng</Text>
          <Text style={styles.headerSub}>{subtitle}</Text>
        </View>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  backBtnText: {
    color: C.primary,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  headerSub: { fontSize: 12, color: C.textLight, marginTop: 2 },
  loginLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.primary,
  },
  loginSub: { fontSize: 15, color: "#444" },
});
