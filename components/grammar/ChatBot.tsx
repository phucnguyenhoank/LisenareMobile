import { API_BASE_URL } from "@/config/env";
import { getToken } from "@/utils/auth-storage";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetch } from "expo/fetch";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Exercise, Question } from "../../types/grammar";
import { C } from "../../theme/grammar_constants";

interface Props {
  exercise: Exercise;
  questions: Question[];
  answers: Record<number, { question_id: number; user_answer: string }>;
}

type ChatView = "current" | "history-list";

interface ChatSession {
  session_id: number;
  exercise_id: number;
  exercise_name: string;
  created_at: string | null;
  updated_at: string | null;
  message_count: number;
}

interface HistoryMessage {
  role: string;
  content: string;
}

const INITIAL_MESSAGES = [
  {
    id: "0",
    role: "assistant",
    text: "Xin chào! Bạn đang gặp khó khăn ở câu nào? Mình sẽ gợi ý nhé 😊",
  },
];

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

const renderInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <Text key={index} style={cs.boldText}>{part.slice(2, -2)}</Text>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <Text key={index} style={cs.inlineCode}>{part.slice(1, -1)}</Text>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <Text key={index} style={cs.italicText}>{part.slice(1, -1)}</Text>;
    return part;
  });
};

const renderFormattedText = (text: string, isUser: boolean) => {
  if (isUser) return <Text style={cs.userText}>{text}</Text>;
  const lines = text.split("\n");
  return (
    <View>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={index} style={{ height: 6 }} />;
        if (trimmed.startsWith("###"))
          return <Text key={index} style={cs.aiHeading}>{trimmed.replace(/^#+\s*/, "")}</Text>;
        if (trimmed.startsWith("* ") || trimmed.startsWith("- "))
          return (
            <View key={index} style={cs.bulletRow}>
              <Text style={cs.bulletDot}>•</Text>
              <Text style={cs.aiText}>{renderInlineMarkdown(trimmed.replace(/^[-*]\s*/, ""))}</Text>
            </View>
          );
        return <Text key={index} style={cs.aiText}>{renderInlineMarkdown(trimmed)}</Text>;
      })}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ChatButton = ({ exercise, questions, answers }: Props) => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const [chatView, setChatView] = useState<ChatView>("current");
  const [learnerId, setLearnerId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const resolveLearnerId = async (): Promise<number> => {
    if (learnerId !== null) return learnerId;
    const token = await getToken();
    const user = (await fetch(`${API_BASE_URL}/learners/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json())) as { id: number };
    setLearnerId(user.id);
    return user.id;
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const id = await resolveLearnerId();
      const token = await getToken();
      const data = (await fetch(
        `${API_BASE_URL}/grammar/chat/history/${id}/${exercise.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ).then((r) => r.json())) as { sessions: ChatSession[] };
      setSessions(data.sessions ?? []);
      setChatView("history-list");
    } catch {
    } finally {
      setHistoryLoading(false);
    }
  };

  const openSession = async (session: ChatSession) => {
    setHistoryLoading(true);
    try {
      const token = await getToken();
      const data = (await fetch(
        `${API_BASE_URL}/grammar/chat/session/${session.session_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ).then((r) => r.json())) as { messages: HistoryMessage[] };
      const loaded = (data.messages ?? []).map((m, i) => ({
        id: `h${i}`,
        role: m.role,
        text: m.content,
      }));
      setMessages(loaded.length ? loaded : INITIAL_MESSAGES);
      setSessionId(session.session_id);
      setCurrentQuestionId(null);
      setChatView("current");
    } catch {
    } finally {
      setHistoryLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages(INITIAL_MESSAGES);
    setSessionId(null);
    setCurrentQuestionId(null);
    setInput("");
    setChatView("current");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: "user", text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = await getToken();
      const id = await resolveLearnerId();
      const response = await fetch(`${API_BASE_URL}/grammar/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.text })),
          learner_id: id,
          session_id: sessionId,
          context: {
            exercise_name: exercise.name,
            exercise_id: exercise.id,
            current_question_id: currentQuestionId,
            questions: questions.map((q, i) => ({
              order_id: i + 1,
              question_id: q.question_id,
              question: q.question,
              user_answer: answers[i]?.user_answer ?? null,
            })),
          },
        }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const assistantId = Date.now().toString();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }]);
      setLoading(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        line = line.trim();
        if (!line) return;
        try {
          const data = JSON.parse(line);
          if (data.answer) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              return [...prev.slice(0, -1), { ...last, text: last.text + data.answer }];
            });
          }
          if (data.current_question_id != null) setCurrentQuestionId(data.current_question_id);
          if (data.session_id != null) setSessionId(data.session_id);
        } catch { }
      };

      while (true) {
        const { done, value } = await reader!.read();
        if (done) { if (buffer.trim()) processLine(buffer); break; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1];
        for (let i = 0; i < lines.length - 1; i++) processLine(lines[i]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", text: "Có lỗi xảy ra, thử lại nhé!" }]);
    } finally {
      setLoading(false);
      flatListRef.current?.scrollToEnd();
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const renderHistoryView = () => {
    if (historyLoading) {
      return (
        <View style={cs.centerLoading}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      );
    }
    if (sessions.length === 0) {
      return (
        <View style={cs.centerLoading}>
          <Ionicons name="chatbubbles-outline" size={48} color={C.primaryMid} />
          <Text style={cs.emptyText}>Chưa có lịch sử chat nào.</Text>
        </View>
      );
    }
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }}>
        {sessions.map((s) => (
          <TouchableOpacity key={s.session_id} style={cs.sessionCard} onPress={() => openSession(s)} activeOpacity={0.8}>
            <View style={cs.sessionIconWrap}>
              <Ionicons name="chatbubble-outline" size={18} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cs.sessionTitle}>{formatDate(s.created_at)}</Text>
              <Text style={cs.sessionMeta}>{s.message_count} tin nhắn · cập nhật {formatDate(s.updated_at)}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={C.textLight} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderChatView = () => (
    <>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        style={cs.messageList}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item }) => (
          <View style={[cs.bubble, item.role === "user" ? cs.userBubble : cs.aiBubble]}>
            {renderFormattedText(item.text, item.role === "user")}
          </View>
        )}
      />

      {loading && (
        <View style={cs.typingRow}>
          <View style={cs.typingDot} />
          <View style={[cs.typingDot, { opacity: 0.6 }]} />
          <View style={[cs.typingDot, { opacity: 0.3 }]} />
        </View>
      )}

      <View style={cs.inputRow}>
        <TextInput
          style={cs.input}
          placeholder="Nhập câu hỏi của bạn..."
          placeholderTextColor={C.textLight}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline
        />
        <Pressable style={cs.sendBtn} onPress={sendMessage} android_ripple={{ color: "rgba(255,255,255,0.3)" }}>
          <Ionicons name="send" size={16} color="#fff" />
        </Pressable>
      </View>
    </>
  );

  return (
    <>
      {/* FAB */}
      <TouchableOpacity style={cs.fab} onPress={() => setVisible(true)} activeOpacity={0.85}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={cs.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={cs.chatBox}>
            {/* Header */}
            {chatView === "history-list" ? (
              <View style={cs.header}>
                <TouchableOpacity onPress={() => setChatView("current")} style={cs.headerBackBtn}>
                  <Feather name="arrow-left" size={20} color={C.textMid} />
                </TouchableOpacity>
                <Text style={[cs.headerTitle, { flex: 1 }]}>Lịch sử chat</Text>
                <TouchableOpacity onPress={() => setVisible(false)} style={cs.headerCloseBtn}>
                  <Feather name="x" size={20} color={C.textSoft} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={cs.header}>
                <View style={cs.headerAvatar}>
                  <Ionicons name="hardware-chip-outline" size={20} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={cs.headerTitle}>Trợ lý AI</Text>
                  <View style={cs.onlineRow}>
                    <View style={cs.onlineDot} />
                    <Text style={cs.onlineText}>Online</Text>
                  </View>
                </View>
                <View style={cs.headerActions}>
                  <TouchableOpacity onPress={startNewChat} style={cs.headerIconBtn}>
                    <Feather name="edit" size={18} color={C.textMid} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={fetchHistory} style={cs.headerIconBtn}>
                    <Feather name="clock" size={18} color={C.textMid} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setVisible(false)} style={cs.headerIconBtn}>
                    <Feather name="x" size={20} color={C.textSoft} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {chatView === "history-list" ? renderHistoryView() : renderChatView()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const cs = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  chatBox: {
    backgroundColor: "#F7FAF4",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "72%",
    overflow: "hidden",
  },

  // Header
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
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#22C55E",
  },
  onlineText: {
    fontSize: 11,
    color: "#22C55E",
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  headerCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  // Chat
  messageList: { flex: 1 },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: C.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiText: { color: C.text, fontSize: 14, lineHeight: 21 },
  userText: { color: "#fff", fontSize: 14, lineHeight: 21 },
  aiHeading: { color: C.text, fontSize: 15, fontWeight: "700", marginTop: 6, marginBottom: 2, lineHeight: 22 },
  boldText: { fontWeight: "700", color: C.text },
  italicText: { fontStyle: "italic", color: C.text },
  inlineCode: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: "#F3F4F6",
    color: C.text,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 13,
  },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginVertical: 1 },
  bulletDot: { color: C.text, marginRight: 6, lineHeight: 21 },

  // Typing indicator
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.primaryMid,
  },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: C.text,
    maxHeight: 100,
    backgroundColor: "#F9FAFB",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // History
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  emptyText: { color: C.textSoft, fontSize: 14 },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  sessionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    marginBottom: 2,
  },
  sessionMeta: { fontSize: 12, color: C.textSoft },
});

export { ChatButton };
