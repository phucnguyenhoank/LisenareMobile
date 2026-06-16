import { request } from "@/services/client";
import { useAuth } from "@/context/AuthContext";
import colors from "@/theme/colors";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = { role: "user" | "assistant"; content: string };

type ToolCallLog = {
  name: string;
  args: Record<string, unknown>;
  result_summary: string;
};

type AgentChatResponse = {
  answer: string;
  tool_calls: ToolCallLog[];
};

const SAMPLE_PROMPTS = [
  "Hôm nay nên học gì?",
  "Trình độ của tôi hiện tại thế nào?",
  "Liệt kê các topic ngữ pháp đang có",
  "Gần đây tôi làm bài thế nào, sai nhiều ở đâu?",
];

export default function AgentTestScreen() {
  const { token, isTokenLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [learnerId, setLearnerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastToolCalls, setLastToolCalls] = useState<ToolCallLog[]>([]);
  const [showToolLog, setShowToolLog] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await request<{ id: number }>("/learners/me");
        if (!cancelled) setLearnerId(me.id);
      } catch (e: any) {
        if (!cancelled)
          setBootError(e?.message ?? "Không lấy được learner_id");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const sendMessage = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || sending || learnerId == null) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await request<AgentChatResponse>("/agent/chat", {
        method: "POST",
        body: { learner_id: learnerId, messages: next },
      });
      setMessages([
        ...next,
        { role: "assistant", content: res.answer || "(rỗng)" },
      ]);
      setLastToolCalls(res.tool_calls ?? []);
    } catch (e: any) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `❗ Lỗi gọi agent: ${e?.message ?? "không rõ"}`,
        },
      ]);
      setLastToolCalls([]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setLastToolCalls([]);
    setInput("");
  };

  if (isTokenLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.softText}>
          Bạn cần đăng nhập để test agent.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/setting")}
        >
          <Text style={styles.primaryBtnText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: "Test Agent",
          headerShown: true,
          headerRight: () => (
            <Pressable
              onPress={resetConversation}
              style={({ pressed }) => ({
                opacity: pressed ? 0.4 : 1,
                marginRight: 12,
              })}
              hitSlop={12}
            >
              <Feather name="refresh-ccw" size={20} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <View style={styles.metaBar}>
        <Text style={styles.metaText}>
          learner_id:{" "}
          <Text style={styles.metaValue}>
            {learnerId ?? (bootError ? "lỗi" : "...")}
          </Text>
        </Text>
        <TouchableOpacity
          onPress={() => setShowToolLog((v) => !v)}
          style={styles.toggleBtn}
        >
          <Feather
            name={showToolLog ? "eye" : "eye-off"}
            size={14}
            color={colors.secondary}
          />
          <Text style={styles.toggleText}>
            {showToolLog ? "Ẩn tool log" : "Hiện tool log"}
          </Text>
        </TouchableOpacity>
      </View>

      {bootError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{bootError}</Text>
        </View>
      )}

      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>🤖 Agent Tester</Text>
            <Text style={styles.welcomeText}>
              Gửi câu hỏi để kiểm tra vòng lặp function-calling. Mỗi response
              sẽ in kèm các tool agent đã gọi.
            </Text>
            <Text style={[styles.welcomeText, { marginTop: 8 }]}>
              Câu hỏi gợi ý:
            </Text>
            <View style={styles.chipRow}>
              {SAMPLE_PROMPTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.chip}
                  onPress={() => sendMessage(p)}
                  disabled={sending || learnerId == null}
                >
                  <Text style={styles.chipText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((m, i) => (
          <View key={i} style={styles.msgBlock}>
            {m.role === "user" ? (
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{m.content}</Text>
              </View>
            ) : (
              <View style={styles.assistantBubble}>
                {m.content ? (
                  <Markdown style={mdStyles}>{m.content}</Markdown>
                ) : (
                  <ActivityIndicator color={colors.secondary} />
                )}
              </View>
            )}
          </View>
        ))}

        {sending && (
          <View style={styles.assistantBubble}>
            <ActivityIndicator color={colors.secondary} />
            <Text style={styles.thinkingText}>Agent đang suy nghĩ...</Text>
          </View>
        )}

        {showToolLog && lastToolCalls.length > 0 && (
          <View style={styles.toolLogBox}>
            <Text style={styles.toolLogTitle}>
              🛠 Tool calls ({lastToolCalls.length})
            </Text>
            {lastToolCalls.map((tc, idx) => (
              <View key={idx} style={styles.toolItem}>
                <Text style={styles.toolName}>
                  {idx + 1}. {tc.name}
                </Text>
                {Object.keys(tc.args ?? {}).length > 0 && (
                  <Text style={styles.toolArgs}>
                    args: {JSON.stringify(tc.args)}
                  </Text>
                )}
                <Text style={styles.toolResult}>
                  → {tc.result_summary}
                </Text>
              </View>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View style={{ paddingHorizontal: 12 }}>
          <View style={[styles.inputBar, { marginBottom: insets.bottom + 8 }]}>
            <TextInput
              placeholder="Hỏi agent..."
              placeholderTextColor="#999"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
              editable={!sending && learnerId != null}
              multiline
            />
            <Pressable
              onPress={() => sendMessage()}
              disabled={sending || !input.trim() || learnerId == null}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  opacity:
                    sending || !input.trim() || learnerId == null
                      ? 0.4
                      : pressed
                        ? 0.7
                        : 1,
                },
              ]}
            >
              <Feather name="arrow-up" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const mdStyles = {
  body: { color: colors.text, fontSize: 14, lineHeight: 21 },
  text: { color: colors.text },
  code_inline: {
    backgroundColor: colors.buttonBackground,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
} as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 24,
  },
  softText: { color: colors.textSecondary, fontSize: 14 },
  primaryBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  metaBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.buttonBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaText: { fontSize: 12, color: colors.textSecondary },
  metaValue: { fontWeight: "700", color: colors.text },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: { fontSize: 12, color: colors.secondary, fontWeight: "600" },

  errorBox: {
    backgroundColor: "#FFF1F2",
    padding: 10,
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: { color: "#B91C1C", fontSize: 13 },

  scrollContent: { padding: 16, paddingBottom: 32, gap: 12 },

  welcomeBox: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  welcomeText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.buttonBackground,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: 12, color: colors.secondary, fontWeight: "600" },

  msgBlock: { marginBottom: 6 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderBottomRightRadius: 4,
    maxWidth: "85%",
  },
  userText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: "92%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  thinkingText: { color: colors.textSecondary, fontSize: 13 },

  toolLogBox: {
    marginTop: 4,
    padding: 12,
    backgroundColor: "#0F172A",
    borderRadius: 10,
  },
  toolLogTitle: {
    color: "#A7F3D0",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  toolItem: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  toolName: { color: "#FDE68A", fontSize: 12, fontWeight: "700" },
  toolArgs: { color: "#93C5FD", fontSize: 11, marginTop: 2 },
  toolResult: { color: "#E5E7EB", fontSize: 11, marginTop: 2 },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: colors.secondary,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
