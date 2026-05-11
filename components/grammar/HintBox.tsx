import { API_BASE_URL } from "@/config/env";
import { S } from "@/theme/grammar_styles";
import { getToken } from "@/utils/authStorage";
import { fetch } from "expo/fetch";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useQuizContext } from "../../context/QuizContext";
import { C } from "../../theme/grammar_constants";
import { Question } from "../../types/grammar";

export function HintBox({ question_hinted }: { question_hinted: Question }) {
  const { exercise, questions, answers } = useQuizContext();
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const hintedIndex = questions.findIndex(
    (q) => q.question_id === question_hinted.question_id
  );

  const handleHint = async () => {
    setShowModal(true);
    if (hint) return;

    setHintLoading(true);
    setHint("");
    try {
      const token = await getToken();
      const user = await fetch(`${API_BASE_URL}/learners/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()) as { id: number };

      const response = await fetch(`${API_BASE_URL}/grammar/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          learner_id: user.id,
          context: {
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            questions: questions.map((q, i) => ({
              question_id: q.question_id,
              question: q.question,
              user_answer: answers[i]?.user_answer ?? null,
            })),
          },
          question_hinted: {
            question_id: question_hinted.question_id,
            question: question_hinted.question,
            user_answer: answers[hintedIndex]?.user_answer ?? null,
          },
        }),
      });

      if (!response.ok) throw new Error("Suggest failed");

      setHintLoading(false); // tắt spinner, bắt đầu hiện text stream

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // setHint((prev) => (prev ?? "") + chunk); // nối dần từng chunk
        for (const char of chunk) {
          setHint((prev) => (prev ?? "") + char);
          await new Promise((resolve) => setTimeout(resolve, 2)); // 20ms mỗi ký tự
        }
      }
    } catch {
      setHint("Có lỗi xảy ra");
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleHint} style={S.hintBtn}>
        <Text style={S.hintIcon}>💡</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={S.overlay} />
        </TouchableWithoutFeedback>

        <View style={S.sheet}>
          <View style={S.sheetHandle} />
          <Text style={S.sheetTitle}>💡 Gợi ý</Text>

          {hintLoading ? (
            <ActivityIndicator size="small" color={C.primary} style={{ marginTop: 16 }} />
          ) : (
            <Text style={S.sheetText}>{hint}</Text>
          )}

          <TouchableOpacity onPress={() => setShowModal(false)} style={S.closeBtn}>
            <Text style={S.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
