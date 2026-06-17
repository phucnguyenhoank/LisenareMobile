import { API_BASE_URL } from "@/config/env";
import { S } from "@/theme/grammar_styles";
import { getToken } from "@/utils/auth-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetch } from "expo/fetch";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
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

      setHintLoading(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const char of chunk) {
          setHint((prev) => (prev ?? "") + char);
          await new Promise((resolve) => setTimeout(resolve, 2));
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
      <Pressable onPress={handleHint} style={S.hintBtn}>
        <Ionicons name="bulb-outline" size={18} color="#B58900" />
      </Pressable>

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Ionicons name="bulb-outline" size={18} color="#B58900" />
            <Text style={S.sheetTitle}>Gợi ý</Text>
          </View>

          {hintLoading ? (
            <ActivityIndicator size="small" color={C.primary} style={{ marginTop: 16 }} />
          ) : (
            <Text style={S.sheetText}>{hint}</Text>
          )}

          <Pressable onPress={() => setShowModal(false)} style={S.closeBtn} android_ripple={{ color: C.border }}>
            <Text style={S.closeBtnText}>Đóng</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
