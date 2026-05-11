import { API_BASE_URL } from "@/config/env";
import { getToken } from "@/utils/authStorage";
import { fetch } from "expo/fetch";
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Exercise, Question } from "../../types/grammar";

interface Props {
  exercise: Exercise;
  questions: Question[];
  answers: Record<number, { question_id: number; user_answer: string }>;
}

const ChatButton = ({ exercise, questions, answers }: Props) => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: '0', role: 'assistant', text: 'Xin chào! Bạn đang gặp khó khăn ở câu nào? Mình sẽ gợi ý nhé 😊' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const token = await getToken();

      const user = await fetch(`${API_BASE_URL}/learners/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()) as { id: number };

      const response = await fetch(`${API_BASE_URL}/grammar/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
          learner_id: user.id,
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

      if (!response.ok) throw new Error('Chat failed');

      // Thêm message rỗng của assistant trước
      const assistantId = Date.now().toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', text: '' }]);
      setLoading(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
          if (data.current_question_id !== null && data.current_question_id !== undefined) {
            setCurrentQuestionId(data.current_question_id);
          }
        } catch (e) {
          console.error('Failed to parse JSON line:', line);
        }
      };

      while (true) {
        const { done, value } = await reader!.read();
        if (done) {
          if (buffer.trim()) processLine(buffer); // flush remaining buffer
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          processLine(lines[i]);
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Có lỗi xảy ra, thử lại nhé!'
      }]);
    } finally {
      setLoading(false);
      flatListRef.current?.scrollToEnd();
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.chatBox}>
            <View style={styles.header}>
              <Text style={styles.headerText}>🤖 Trợ lý AI</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              style={styles.messageList}
              renderItem={({ item }) => (
                <View style={[
                  styles.bubble,
                  item.role === 'user' ? styles.userBubble : styles.aiBubble
                ]}>
                  <Text style={item.role === 'user' ? styles.userText : styles.aiText}>
                    {item.text}
                  </Text>
                </View>
              )}
            />

            {loading && <ActivityIndicator style={{ marginBottom: 8 }} color="#6C63FF" />}

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Nhập câu hỏi..."
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Text style={styles.sendText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: { fontSize: 22 },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  chatBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: { fontSize: 16, fontWeight: '600', color: '#333' },
  closeBtn: { fontSize: 18, color: '#999' },
  messageList: { flex: 1, marginVertical: 8 },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  aiBubble: { backgroundColor: '#F0EEFF', alignSelf: 'flex-start' },
  userBubble: { backgroundColor: '#6C63FF', alignSelf: 'flex-end' },
  aiText: { color: '#333' },
  userText: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: { color: '#fff', fontWeight: '600' },
});

export { ChatButton };

