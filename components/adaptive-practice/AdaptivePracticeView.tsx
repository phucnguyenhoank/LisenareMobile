import { RequestError as ApiError, request } from "@/services/client";
import { Topic } from "@/types/grammar";
import {
  AnswerPracticeResponse,
  PracticeQuestion,
  StartPracticeResponse,
} from "@/types/practice";
import Feather from "@expo/vector-icons/Feather";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PracticeQuestionCard } from "./PracticeQuestionCard";
import { PracticeResult } from "./PracticeResult";
import { TopicSelector } from "./TopicSelector";
import { C } from "@/theme/grammar_constants";

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

interface Props {
  topics: Topic[];
  loadingTopics: boolean;
  topicError: string | null;
  onRetry: () => void;
  onExit: () => void;
}

export function AdaptivePracticeView({
  topics,
  loadingTopics,
  topicError,
  onRetry,
  onExit,
}: Props) {
  const [phase, setPhase] = useState<Phase>({ type: "select" });
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoNext, setAutoNext] = useState(false);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const tryEnd = useCallback(async (sessionId: string, learnerId: number) => {
    try {
      await request("/practice/end", {
        method: "POST",
        body: { session_id: sessionId, learner_id: learnerId },
      });
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      const current = phaseRef.current;
      if (current.type === "session") tryEnd(current.sessionId, current.learnerId);
    };
  }, [tryEnd]);

  const handleStart = useCallback(async (topicIds: number[]) => {
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
        Alert.alert("Chưa có câu hỏi", "Các chủ đề bạn chọn chưa có câu hỏi luyện tập (REVIEW). Hãy thử chọn chủ đề khác.");
      } else {
        Alert.alert("Không bắt đầu được", e?.message ?? "Có lỗi xảy ra khi bắt đầu phiên luyện tập");
      }
    } finally {
      setStarting(false);
    }
  }, []);

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
          Alert.alert("Phiên đã hết hạn", "Phiên luyện tập đã hết hạn. Hãy bắt đầu lại.");
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
      const newCorrect = current.correctCount + (answerRes.is_correct ? 1 : 0);
      if (answerRes.practice_completed || !answerRes.next_question) {
        tryEnd(current.sessionId, current.learnerId);
        setPhase({ type: "result", totalAnswered: current.questionIndex, correctCount: newCorrect, finalTheta: answerRes.theta });
      } else {
        setPhase({ ...current, question: answerRes.next_question, theta: answerRes.theta, questionIndex: current.questionIndex + 1, correctCount: newCorrect });
      }
    },
    [tryEnd],
  );

  const handleExit = useCallback(() => {
    const current = phaseRef.current;
    if (current.type === "session") {
      Alert.alert("Kết thúc luyện tập?", "Bạn có chắc muốn thoát phiên luyện tập hiện tại?", [
        { text: "Tiếp tục", style: "cancel" },
        { text: "Thoát", style: "destructive", onPress: () => { tryEnd(current.sessionId, current.learnerId); onExit(); } },
      ]);
    } else {
      onExit();
    }
  }, [onExit, tryEnd]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { handleExit(); return true; });
    return () => sub.remove();
  }, [handleExit]);

  const sessionPhase = phase.type === "session" ? phase : null;

  const renderContent = () => {
    if (phase.type === "select") {
      return (
        <TopicSelector
          topics={topics}
          loading={loadingTopics}
          error={topicError}
          starting={starting}
          onStart={handleStart}
          onRetry={onRetry}
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
        onExit={onExit}
      />
    );
  };

  return (
    <View style={av.fill}>
      {/* Header */}
      <View style={av.header}>
        <Pressable onPress={handleExit} style={av.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={C.textMid} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={av.headerTitle}>Luyện tập thích ứng</Text>
          {phase.type === "session" && (
            <Text style={av.headerSub}>Câu {phase.questionIndex}</Text>
          )}
          {phase.type === "select" && (
            <Text style={av.headerSub}>Chọn chủ đề</Text>
          )}
          {phase.type === "result" && (
            <Text style={av.headerSub}>Kết quả</Text>
          )}
        </View>
        {/* Progress indicator for session */}
        {sessionPhase && (
          <View style={av.sessionBadge}>
            <Feather name="check-circle" size={13} color={C.success} />
            <Text style={av.sessionBadgeText}>{sessionPhase.correctCount}</Text>
          </View>
        )}
      </View>

      {/* Progress stats bar (select phase) */}
      {phase.type === "select" && (
        <View style={av.statsBar}>
          <View style={av.statsCircleWrap}>
            <View style={av.statsCircle}>
              <Text style={av.statsCirclePct}>35%</Text>
            </View>
          </View>
          <View style={av.statsRight}>
            <Text style={av.statsNum}>22 câu đã luyện</Text>
            <View style={av.statsTagRow}>
              <View style={av.statsTag}>
                <Text style={av.statsTagText}>Cố lên 💪</Text>
              </View>
            </View>
          </View>
          <View style={av.statsDivider} />
          <View style={av.statsActionCol}>
            <Feather name="bar-chart-2" size={22} color={C.primary} />
            <Text style={av.statsActionText}>Thống kê</Text>
          </View>
        </View>
      )}

      {renderContent()}
    </View>
  );
}

const av = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#F7FAF4" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  headerSub: {
    fontSize: 12,
    color: C.textSoft,
    marginTop: 1,
  },
  sessionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: C.successLight,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  sessionBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
  },

  // Stats bar (select phase)
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  statsCircleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  statsCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  statsCirclePct: {
    fontSize: 13,
    fontWeight: "800",
    color: C.primary,
  },
  statsRight: {
    flex: 1,
    gap: 4,
  },
  statsNum: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  statsTagRow: {
    flexDirection: "row",
    gap: 6,
  },
  statsTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statsTagText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "600",
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  statsActionCol: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
  },
  statsActionText: {
    fontSize: 11,
    color: C.textSoft,
    fontWeight: "500",
  },
});
