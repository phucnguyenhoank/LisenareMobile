import { RequestError as ApiError, request } from "@/services/client";
import { S } from "@/theme/grammar_styles";
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
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const tryEnd = useCallback(async (sessionId: string, learnerId: number) => {
    try {
      await request("/practice/end", {
        method: "POST",
        body: { session_id: sessionId, learner_id: learnerId },
      });
    } catch {
      // session đã hết hạn — không cần xử lý
    }
  }, []);

  useEffect(() => {
    return () => {
      const current = phaseRef.current;
      if (current.type === "session") {
        tryEnd(current.sessionId, current.learnerId);
      }
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
      const newCorrect = current.correctCount + (answerRes.is_correct ? 1 : 0);

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
              onExit();
            },
          },
        ],
      );
    } else {
      onExit();
    }
  }, [onExit, tryEnd]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleExit();
      return true;
    });
    return () => sub.remove();
  }, [handleExit]);

  const subtitle =
    phase.type === "select"
      ? "Chọn chủ đề"
      : phase.type === "session"
        ? `Câu ${phase.questionIndex}`
        : "Kết quả";

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
    <View style={S.fill}>
      <View style={S.header}>
        <Pressable onPress={handleExit} style={S.backBtn}>
          <Feather name="arrow-left" size={20} color={C.textMid} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>Luyện tập thích ứng</Text>
          <Text style={S.headerSub}>{subtitle}</Text>
        </View>
      </View>
      {renderContent()}
    </View>
  );
}
