import { streamChat } from "@/api/stream-client";
import colors from "@/theme/colors";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    if (!userQuestion.trim()) return;

    setUserQuestion("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
      { role: "assistant", content: "" },
    ]);

    try {
      await streamChat(userQuestion, (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        });
      });
    } catch (err) {
      console.error("Streaming error:", err);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        {messages.map((msg, i) => (
          <View key={i} style={styles.section}>
            {msg.role === "user" ? (
              <View style={styles.questionHeader}>
                <View style={styles.bullet} />
                <Text style={styles.questionText}>{msg.content}</Text>
              </View>
            ) : (
              <View style={styles.markdownContainer}>
                <Markdown style={markdownStyles}>{msg.content}</Markdown>
              </View>
            )}
          </View>
        ))}
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View style={{ paddingHorizontal: 12 }}>
          <View
            style={[
              styles.inputBar,
              {
                marginBottom: insets.bottom + 8,
              },
            ]}
          >
            <TextInput
              placeholder="Bạn cần hỏi gì?"
              placeholderTextColor="#999"
              style={styles.input}
              value={userQuestion}
              onChangeText={setUserQuestion}
              onSubmitEditing={sendMessage}
            />
            <Pressable onPress={sendMessage}>
              <Feather
                name="arrow-up"
                size={22}
                color="white"
                style={styles.send}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const markdownStyles = {
  body: {
    color: "black",
    fontSize: 16,
    lineHeight: 24,
  },
  text: {
    color: "black",
  },
} as const;

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: "black",
  },

  send: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 16,
  },
  root: {
    flex: 1,
    backgroundColor: "#FBFAFA",
  },
  markdownContainer: {
    paddingLeft: 10,
  },
  container: {
    padding: 16,
    paddingTop: 32,
  },
  section: {
    marginBottom: 24,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F0F4F8",
    padding: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  bullet: {
    width: 4,
    height: 16,
    backgroundColor: colors.secondary2,
    marginRight: 10,
    borderRadius: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "black",
  },
});
