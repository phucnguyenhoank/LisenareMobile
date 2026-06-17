import { request } from "@/services/client";
import { useAuth } from "@/context/AuthContext";
import { C } from "@/theme/grammar_constants";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
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
        if (!cancelled) setBootError(e?.message ?? "Không lấy được learner_id");
      }
    })();
    return () => { cancelled = true; };
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
      setMessages([...next, { role: "assistant", content: res.answer || "(rỗng)" }]);
      setLastToolCalls(res.tool_calls ?? []);
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: `❗ Lỗi gọi agent: ${e?.message ?? "không rõ"}` }]);
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
      <View style={ag.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={ag.center}>
        <View style={ag.robotCircle}>
          <Ionicons name="hardware-chip-outline" size={40} color={C.primary} />
        </View>
        <Text style={ag.emptyTitle}>Test Agent</Text>
        <Text style={ag.emptyText}>Bạn cần đăng nhập để sử dụng tính năng này.</Text>
        <TouchableOpacity style={ag.primaryBtn} onPress={() => router.push("/setting")} activeOpacity={0.8}>
          <Text style={ag.primaryBtnText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={ag.root}>
      <Stack.Screen
        options={{
          title: "Test Agent",
          headerShown: true,
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontSize: 17, fontWeight: "700", color: C.text },
          headerRight: () => (
            <Pressable
              onPress={resetConversation}
              style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, marginRight: 4 })}
              hitSlop={12}
            >
              <Feather name="refresh-ccw" size={20} color={C.textMid} />
            </Pressable>
          ),
        }}
      />

      {/* Meta bar */}
      <View style={ag.metaBar}>
        <View style={ag.metaPill}>
          <Text style={ag.metaLabel}>learner_id</Text>
          <Text style={ag.metaValue}>{learnerId ?? (bootError ? "lỗi" : "...")}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowToolLog((v) => !v)} style={ag.toggleBtn} activeOpacity={0.75}>
          <Feather name={showToolLog ? "eye-off" : "eye"} size={13} color={C.primary} />
          <Text style={ag.toggleText}>{showToolLog ? "Ẩn tool log" : "Hiện tool log"}</Text>
        </TouchableOpacity>
      </View>

      {bootError && (
        <View style={ag.errorBox}>
          <Feather name="alert-circle" size={14} color="#B91C1C" />
          <Text style={ag.errorText}>{bootError}</Text>
        </View>
      )}

      <KeyboardAwareScrollView ref={scrollRef} contentContainerStyle={ag.scrollContent}>
        {messages.length === 0 && (
          <View style={ag.welcomeBox}>
            <View style={ag.welcomeIconRow}>
              <View style={ag.welcomeIcon}>
                <Ionicons name="hardware-chip-outline" size={28} color={C.primary} />
              </View>
            </View>
            <Text style={ag.welcomeTitle}>Agent Tester</Text>
            <Text style={ag.welcomeText}>
              Gửi câu hỏi để kiểm tra vòng lặp function-calling. Mỗi response sẽ kèm các tool agent đã gọi.
            </Text>
            <Text style={ag.welcomeSub}>Bạn có thể hỏi về:</Text>
            <View style={ag.chipRow}>
              {SAMPLE_PROMPTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={ag.chip}
                  onPress={() => sendMessage(p)}
                  disabled={sending || learnerId == null}
                  activeOpacity={0.75}
                >
                  <Text style={ag.chipText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((m, i) => (
          <View key={i} style={ag.msgRow}>
            {m.role === "user" ? (
              <View style={ag.userBubble}>
                <Text style={ag.userText}>{m.content}</Text>
              </View>
            ) : (
              <View style={ag.assistantRow}>
                <View style={ag.aiBadge}>
                  <Ionicons name="hardware-chip-outline" size={14} color={C.primary} />
                </View>
                <View style={ag.assistantBubble}>
                  {m.content ? (
                    <Markdown style={mdStyles}>{m.content}</Markdown>
                  ) : (
                    <ActivityIndicator color={C.primary} size="small" />
                  )}
                </View>
              </View>
            )}
          </View>
        ))}

        {sending && (
          <View style={ag.assistantRow}>
            <View style={ag.aiBadge}>
              <Ionicons name="hardware-chip-outline" size={14} color={C.primary} />
            </View>
            <View style={ag.assistantBubble}>
              <ActivityIndicator color={C.primary} size="small" />
              <Text style={ag.thinkingText}>Agent đang suy nghĩ...</Text>
            </View>
          </View>
        )}

        {showToolLog && lastToolCalls.length > 0 && (
          <View style={ag.toolLogBox}>
            <View style={ag.toolLogHeader}>
              <Feather name="tool" size={13} color="#A7F3D0" />
              <Text style={ag.toolLogTitle}>Tool calls ({lastToolCalls.length})</Text>
            </View>
            {lastToolCalls.map((tc, idx) => (
              <View key={idx} style={ag.toolItem}>
                <Text style={ag.toolName}>{idx + 1}. {tc.name}</Text>
                {Object.keys(tc.args ?? {}).length > 0 && (
                  <Text style={ag.toolArgs}>args: {JSON.stringify(tc.args)}</Text>
                )}
                <Text style={ag.toolResult}>→ {tc.result_summary}</Text>
              </View>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View style={ag.inputWrap}>
          <View style={[ag.inputBar, { marginBottom: insets.bottom + 8 }]}>
            <TextInput
              placeholder="Hỏi agent..."
              placeholderTextColor="#9CA3AF"
              style={ag.input}
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
                ag.sendBtn,
                { opacity: sending || !input.trim() || learnerId == null ? 0.4 : pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="arrow-up" size={18} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const mdStyles = {
  body: { color: C.text, fontSize: 14, lineHeight: 21 },
  text: { color: C.text },
  code_inline: { backgroundColor: C.primaryLight, paddingHorizontal: 4, borderRadius: 4, color: C.primaryDark },
} as const;

const ag = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7FAF4" },
  center: {
    flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 32,
    backgroundColor: "#F7FAF4",
  },
  robotCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: C.text },
  emptyText: { fontSize: 14, color: C.textSoft, textAlign: "center", lineHeight: 20 },
  primaryBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 13, marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Meta bar
  metaBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  metaPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.primaryLight, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  metaLabel: { fontSize: 11, color: C.textSoft },
  metaValue: { fontSize: 12, fontWeight: "700", color: C.primary },
  toggleBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20,
    backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primaryMid,
  },
  toggleText: { fontSize: 12, color: C.primary, fontWeight: "600" },

  // Error
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FFF1F2", margin: 12, padding: 10,
    borderRadius: 8, borderWidth: 1, borderColor: "#FCA5A5",
  },
  errorText: { color: "#B91C1C", fontSize: 13, flex: 1 },

  scrollContent: { padding: 16, paddingBottom: 32, gap: 10 },

  // Welcome
  welcomeBox: {
    padding: 20, backgroundColor: "#fff", borderRadius: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6, elevation: 1,
  },
  welcomeIconRow: { alignItems: "flex-start", marginBottom: 10 },
  welcomeIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center",
  },
  welcomeTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 6 },
  welcomeText: { fontSize: 13, color: C.textSoft, lineHeight: 19, marginBottom: 10 },
  welcomeSub: { fontSize: 12, color: C.textMid, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: C.primaryLight, borderRadius: 20,
    borderWidth: 1, borderColor: C.primaryMid,
  },
  chipText: { fontSize: 12, color: C.primary, fontWeight: "600" },

  // Messages
  msgRow: { marginBottom: 2 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: C.primary,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomRightRadius: 4,
    maxWidth: "82%",
  },
  userText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  assistantRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, maxWidth: "92%" },
  aiBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center",
    marginTop: 2, flexShrink: 0,
  },
  assistantBubble: {
    flex: 1, backgroundColor: "#fff",
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 14, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: "#E5E7EB",
    flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap",
  },
  thinkingText: { color: C.textSoft, fontSize: 13 },

  // Tool log
  toolLogBox: {
    padding: 12, backgroundColor: "#0F172A", borderRadius: 12, marginTop: 4,
  },
  toolLogHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  toolLogTitle: { color: "#A7F3D0", fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  toolItem: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#1E293B" },
  toolName: { color: "#FDE68A", fontSize: 12, fontWeight: "700" },
  toolArgs: { color: "#93C5FD", fontSize: 11, marginTop: 2 },
  toolResult: { color: "#E5E7EB", fontSize: 11, marginTop: 2 },

  // Input
  inputWrap: { paddingHorizontal: 12, backgroundColor: "#F7FAF4" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    padding: 6, backgroundColor: "#fff",
    borderRadius: 24, borderWidth: 1.5, borderColor: "#E5E7EB", gap: 6,
    shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120,
    paddingHorizontal: 12, paddingVertical: 8,
    color: C.text, fontSize: 14,
  },
  sendBtn: {
    backgroundColor: C.primary, width: 38, height: 38,
    borderRadius: 19, alignItems: "center", justifyContent: "center",
  },
});
