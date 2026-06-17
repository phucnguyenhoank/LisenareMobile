import { API_BASE_URL } from "@/config/env";
import { getToken } from "@/utils/auth-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetch } from "expo/fetch";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
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
      <Pressable onPress={handleHint} style={hs.triggerBtn} hitSlop={6}>
        <Ionicons name="bulb-outline" size={18} color="#D97706" />
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={hs.overlay} />
        </TouchableWithoutFeedback>

        <View style={hs.sheet}>
          <View style={hs.sheetHandle} />

          {/* Bulb icon */}
          <View style={hs.bulbWrap}>
            <View style={hs.bulbCircle}>
              <Ionicons name="bulb" size={52} color="#F59E0B" />
            </View>
          </View>

          <Text style={hs.sheetTitle}>Gợi ý</Text>

          <View style={hs.contentWrap}>
            {hintLoading ? (
              <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 16 }} />
            ) : (
              <Text style={hs.sheetText}>{hint}</Text>
            )}
          </View>

          <Pressable
            onPress={() => setShowModal(false)}
            style={hs.closeBtn}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            <Text style={hs.closeBtnText}>Đóng</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const hs = StyleSheet.create({
  triggerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    alignItems: "center",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
  },
  bulbWrap: {
    marginBottom: 16,
  },
  bulbCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  contentWrap: {
    width: "100%",
    minHeight: 60,
    marginBottom: 24,
  },
  sheetText: {
    fontSize: 15,
    color: C.textMid,
    lineHeight: 24,
    textAlign: "center",
  },
  closeBtn: {
    width: "100%",
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
